import {
    ClusterizedFlatTree,
    MetaClusterizedFlatTree,
    ClusterizedFlatTreeNode,
    Data,
    FlatTree,
    FlatTreeNode,
    Node,
    MetaClusterizedFlatTreeNode,
} from '../../types';

const MIN_BLOCK_SIZE = 1;
const STICK_DISTANCE = 0.25;
//const MIN_CLUSTER_SIZE = MIN_BLOCK_SIZE * 2 + STICK_DISTANCE;

export const walk = (
    treeList: Data,
    cb: (child: Node, parent: any, level: number) => FlatTreeNode,
    parent: FlatTreeNode | Node | null = null,
    level = 0
) => {
    treeList.forEach((child) => {
        const res = cb(child, parent, level);

        if (child.children) {
            walk(child.children, cb, res || child, level + 1);
        }
    });
};

export const flatTree = (treeList: Data): FlatTree => {
    const result: FlatTree = [];
    let index = 0;

    walk(treeList, (node, parent, level) => {
        const newNode: FlatTreeNode = {
            source: node,
            end: node.start + node.duration,
            parent,
            level,
            index: index++,
        };

        result.push(newNode);

        return newNode;
    });

    return result.sort((a, b) => a.level - b.level || a.source.start - b.source.start);
};

export const getFlatTreeMinMax = (flatTree: FlatTree) => {
    let isFirst = true;
    let min = 0;
    let max = 0;
    let maxDepth = 0;

    flatTree.forEach(({ source: { start }, end, level }) => {
        if (isFirst) {
            min = start;
            max = end;
            isFirst = false;
        } else {
            min = min < start ? min : start;
            max = max > end ? max : end;
        }
        if (level > maxDepth) {
            maxDepth = level;
        }
    });

    return { min, max, maxDepth };
};

const calcClusterDuration = (nodes: FlatTreeNode[]) => {
    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];

    return lastNode.source.start + lastNode.source.duration - firstNode.source.start;
};

const checkNodeTimeboundNesting = (node: FlatTreeNode, start: number, end: number) =>
    (node.source.start < end && node.end > start) || (node.source.start > start && node.end < end);

const checkClusterTimeboundNesting = (node: ClusterizedFlatTreeNode, start: number, end: number) =>
    (node.start < end && node.end > start) || (node.start > start && node.end < end);

const defaultClusterizeCondition = (prevNode: FlatTreeNode, node: FlatTreeNode) => {
    return prevNode.source.color === node.source.color && prevNode.source.type === node.source.type;
};

export function metaClusterizeFlatTree(
    flatTree: FlatTree,
    condition = defaultClusterizeCondition
): MetaClusterizedFlatTree {
    let maxDuration = -1;
    return flatTree
        .reduce<MetaClusterizedFlatTreeNode[]>((acc, node) => {
            const lastCluster = acc[acc.length - 1];
            // TODO keep this - I broke it before
            const lastNode = lastCluster && lastCluster.nodes[lastCluster.nodes.length - 1];

            //console.log('maybe check condiiton');
            //const accCopy = [...acc];
            //console.log(accCopy);
            if (lastNode && lastNode.level === node.level && condition(lastNode, node)) {
                if (node.source.duration > maxDuration) {
                    lastCluster.color = node.source.color!;
                    maxDuration = node.source.duration;
                }
                lastCluster.nodes.push(node);
            } else {
                acc.push({ nodes: [node], color: node.source.color! });
                maxDuration = node.source.duration;
            }
            return acc;
        }, [])
        .filter((cluster) => cluster.nodes.length);
}

const splitClusterCondition = (
    prevNode: FlatTreeNode,
    node: FlatTreeNode,
    stickDistance: number,
    minBlockSize: number,
    zoom: number
): boolean => {
    if (node.source.duration < .00001) {
        return true;
    }
    return (
        (node.source.start - (prevNode.source.start + prevNode.source.duration)) * zoom < stickDistance &&
        node.source.duration * zoom < minBlockSize &&
        prevNode.source.duration * zoom < minBlockSize
    );
};

export const clusterizeFlatTree = (
    metaClusterizedFlatTree: MetaClusterizedFlatTree,
    zoom: number,
    start = 0,
    end = 0,
    stickDistance = STICK_DISTANCE,
    minBlockSize = MIN_BLOCK_SIZE
): ClusterizedFlatTree => {
    let lastCluster: MetaClusterizedFlatTreeNode | null = null;
    let lastNode: FlatTreeNode | null = null;
    let index = 0;

    return metaClusterizedFlatTree
        .reduce<MetaClusterizedFlatTreeNode[]>((acc, { nodes, color }) => {
            lastCluster = null;
            lastNode = null;
            index = 0;

            for (const node of nodes) {
                if (!checkNodeTimeboundNesting(node, start, end)) {
                    continue;
                }
                if (lastCluster && !lastNode) {
                    console.log('SHOULD NEVER GET HERE');
                    lastCluster.nodes[index] = node;
                    index++;
                } else if (
                    lastCluster &&
                    lastNode &&
                    splitClusterCondition(lastNode, node, stickDistance, minBlockSize, zoom)
                ) {
                    lastCluster.nodes[index] = node;
                    index++;
                } else {
                    lastCluster = { nodes: [node], color };
                    index = 1;

                    acc.push(lastCluster);
                }

                lastNode = node;
            }

            return acc;
        }, [])
        .map((cluster) => {
            console.log('mapping cluster');
            const node = cluster.nodes[0];
            const duration = calcClusterDuration(cluster.nodes);

            return {
                start: node.source.start,
                end: node.source.start + duration,
                duration,
                type: node.source.type,
                color: cluster.color,
                level: node.level,
                nodes: cluster.nodes,
            };
        });
};

export const reclusterizeClusteredFlatTree = (
    clusteredFlatTree: ClusterizedFlatTree,
    zoom: number,
    start: number,
    end: number,
    stickDistance?: number,
    minBlockSize?: number
): ClusterizedFlatTree => {
    return clusteredFlatTree.reduce<ClusterizedFlatTree>((acc, cluster) => {
        if (checkClusterTimeboundNesting(cluster, start, end)) {
            //if (cluster.duration * zoom <= MIN_CLUSTER_SIZE) {
            console.log('pushing whole cluster');
            acc.push(cluster);
            console.log(stickDistance);
            console.log(minBlockSize);
            //} else {
            /*
                console.log('pushing split cluster');
                console.log(cluster.duration);
                console.log(zoom);
                console.log(MIN_CLUSTER_SIZE);
                acc.push(
                    ...clusterizeFlatTree(
                        [{ nodes: cluster.nodes, color: cluster.color }],
                        zoom,
                        start,
                        end,
                        stickDistance,
                        minBlockSize
                    )
                );
            }*/
        }

        return acc;
    }, []);
};
