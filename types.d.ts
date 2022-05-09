interface Mark {
    shortName: string;
    fullName: string;
    timestamp: number;
    color: string;
    level: number;
}
export declare type Marks = Array<Mark>;
export interface Node {
    name: string;
    start: number;
    duration: number;
    type?: string;
    color?: string;
    children?: Array<Node>;
    outline?: string;
}
export declare type Data = Array<Node>;
export declare type WaterfallItems = Array<{
    name: string;
    intervals: WaterfallInterval[] | string;
    timing: {
        [key: string]: number;
    };
}>;
declare type WaterfallInterval = {
    name: string;
    color: string;
    type: 'block' | 'line';
    start: string;
    end: string;
};
interface WaterfallIntervals {
    [intervalName: string]: WaterfallInterval[];
}
export interface Waterfall {
    items: WaterfallItems;
    intervals: WaterfallIntervals;
}
export declare type Colors = Record<string, string>;
export interface Mouse {
    x: number;
    y: number;
}
interface Dot {
    x: number;
    y: number;
}
export declare type Dots = [Dot, Dot, Dot];
interface Rect {
    x: number;
    y: number;
    w: number;
}
export interface RectRenderQueue {
    [color: string]: Rect[];
}
export interface Text {
    text: string;
    x: number;
    y: number;
    w: number;
    textMaxWidth: number;
}
export interface Stroke {
    color: string;
    x: number;
    y: number;
    w: number;
    h: number;
}
export declare type FlatTreeNode = {
    source: Node;
    end: number;
    parent: FlatTreeNode | null;
    level: number;
    index: number;
};
export declare type FlatTree = FlatTreeNode[];
export interface MetaClusterizedFlatTreeNode {
    nodes: FlatTreeNode[];
}
export declare type MetaClusterizedFlatTree = MetaClusterizedFlatTreeNode[];
export interface ClusterizedFlatTreeNode {
    start: number;
    end: number;
    duration: number;
    type?: string;
    color?: string;
    level: number;
    nodes: FlatTreeNode[];
}
export declare type ClusterizedFlatTree = ClusterizedFlatTreeNode[];
export interface TooltipField {
    color?: string;
    text: string;
}
export interface HitRegion {
    type: string;
    data: any;
    x: number;
    y: number;
    w: number;
    h: number;
    cursor?: string;
    id?: number;
}
export {};
//# sourceMappingURL=types.d.ts.map