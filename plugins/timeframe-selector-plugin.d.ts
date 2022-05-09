import { Data, Mouse } from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import UIPlugin from './ui-plugin';
export declare type TimeframeSelectorPluginStyles = {
    font: string;
    fontColor: string;
    overlayColor: string;
    graphStrokeColor: string;
    graphFillColor: string;
    bottomLineColor: string;
    knobColor: string;
    knobStrokeColor: string;
    knobSize: number;
    height: number;
    backgroundColor: string;
};
export declare type DotNode = {
    color?: string;
    dots: {
        pos: number;
        level: number;
    }[];
};
export declare type TimeframeSelectorPluginSettings = {
    styles?: Partial<TimeframeSelectorPluginStyles>;
};
export declare const defaultTimeframeSelectorPluginStyles: {
    font: string;
    fontColor: string;
    overlayColor: string;
    graphStrokeColor: string;
    graphFillColor: string;
    bottomLineColor: string;
    knobColor: string;
    knobStrokeColor: string;
    knobSize: number;
    height: number;
    backgroundColor: string;
};
export default class TimeframeSelectorPlugin extends UIPlugin<TimeframeSelectorPluginStyles> {
    name: string;
    styles: TimeframeSelectorPluginStyles;
    height: number;
    private data;
    private shouldRender;
    private leftKnobMoving;
    private rightKnobMoving;
    private selectingActive;
    private startSelectingPosition;
    private timeout;
    private offscreenRenderEngine;
    private timeGrid;
    private actualClusters;
    private clusters;
    private maxLevel;
    private nodes;
    private actualClusterizedFlatTree;
    constructor(data: Data, settings: TimeframeSelectorPluginSettings);
    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine): void;
    handleMouseDown(region: any, mouse: Mouse): void;
    handleMouseUp(region: any, mouse: Mouse, isClick: boolean): void;
    handleMouseMove(region: any, mouse: Mouse): void;
    postInit(): void;
    setLeftKnobPosition(mouseX: number): void;
    setRightKnobPosition(mouseX: number): void;
    getLeftKnobPosition(): number;
    getRightKnobPosition(): number;
    applyChanges(): void;
    setSettings({ styles }?: TimeframeSelectorPluginSettings): void;
    setData(data: Data): void;
    offscreenRender(): void;
    castLevelToHeight(level: number, levelHeight: number): number;
    renderTimeframe(): void;
    render(): boolean;
}
//# sourceMappingURL=timeframe-selector-plugin.d.ts.map