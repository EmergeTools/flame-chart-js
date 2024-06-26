const MIN_BLOCK_SIZE = 1;
const STICK_DISTANCE = 0.25;
const MIN_CLUSTER_SIZE = MIN_BLOCK_SIZE * 2 + STICK_DISTANCE;

export const walk = (treeList, cb, parent = null, level = 0) => {
    treeList.forEach((child) => {
        const res = cb(child, parent, level);

        if (child.children) {
            walk(child.children, cb, res || child, level + 1);
        }
    });
}

export const flatTree = (treeList) => {
    const result = [];
    let index = 0;

    walk(treeList, (node, parent, level) => {
        const newNode = {
            ...node,
            end: node.start + node.duration,
            parent,
            level,
            index: index++
        };

        result.push(newNode);

        return newNode;
    });

    return result.sort((a, b) => (a.level - b.level) || a.start - b.start);
}

export const getFlatTreeMinMax = (flatTree) => {
    let isFirst = true;
    let min = 0;
    let max = 0;
    let maxDepth = 0;

    flatTree.forEach(({ start, end, level }) => {
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
}

const calcClusterDuration = (nodes) => {
    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];

    return lastNode.start + lastNode.duration - firstNode.start;
}

const checkTimeboundNesting = (node, start, end) => (
    (
        node.start < end && node.end > start
    ) || (
        node.start > start && node.end < end
    )
)

const defaultClusterizeCondition = (prevNode, node) => (
    prevNode.color === node.color
    && prevNode.type === node.type
)

export const metaClusterizeFlatTree = (flatTree, condition = defaultClusterizeCondition) => {
    return flatTree
        .reduce((acc, node) => {
            const lastCluster = acc[acc.length - 1];
            const lastNode = lastCluster && lastCluster[lastCluster.length - 1];

            if (
                lastNode
                && lastNode.level === node.level
                && condition(lastNode, node)
            ) {
                lastCluster.push(node);
            } else {
                acc.push([node]);
            }

            return acc;
        }, [])
        .filter((nodes) => nodes.length)
        .map((nodes) => ({
            nodes,
            parents: [...new Set(nodes.map(({ parent }) => parent))]
        }));
}

export const clusterizeFlatTree = (metaClusterizedFlatTree, zoom, start, end, stickDistance = STICK_DISTANCE, minBlockSize = MIN_BLOCK_SIZE) => {
    let lastCluster = null;
    let lastNode = null;
    let index = 0;
    let clusters = [];
    let largestNode = null;

    return metaClusterizedFlatTree
        .reduce((acc, { nodes }) => {
            lastCluster = null;
            lastNode = null;
            index = 0;

            for (let node of nodes) {
                if (checkTimeboundNesting(node, start, end)) {
                    if (lastCluster && !lastNode) {
                        lastCluster[index] = node;
                        index++;
                    } else if (
                        lastNode
                        && (node.start - (lastNode.start + lastNode.duration)) * zoom < stickDistance
                        && node.duration * zoom < minBlockSize
                        && lastNode.duration * zoom < minBlockSize
                    ) {
                        lastCluster[index] = node;
                        index++;
                    } else {
                        lastCluster = [node];
                        index = 1;

                        acc.push(lastCluster);
                    }

                    lastNode = node;
                    if (!largestNode || node.duration > largestNode.duration) {
                      largestNode = node;
                    }
                }
            }

            return acc;
        }, clusters)
        .map((nodes) => {
            const node = nodes[0];
            const duration = calcClusterDuration(nodes);

            return {
                start: node.start,
                end: node.start + duration,
                duration,
                type: node.type,
                color: largestNode.color,
                level: node.level,
                nodes
            };
        });
}

export const reclusterizeClusteredFlatTree = (clusteredFlatTree, zoom, start, end, stickDistance, minBlockSize) => {
    return clusteredFlatTree
        .reduce((acc, cluster) => {
            if (checkTimeboundNesting(cluster, start, end)) {
                if (cluster.duration * zoom <= MIN_CLUSTER_SIZE) {
                    acc.push(cluster);
                } else {
                    acc.push(...clusterizeFlatTree([cluster], zoom, start, end, stickDistance, minBlockSize));
                }
            }

            return acc;
        }, []);
}
