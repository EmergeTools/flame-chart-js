import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import UIPlugin from './ui-plugin';

export default class DetailsBarPlugin extends UIPlugin {
    name = 'detailsBarPlugin';

    height: number;
    currentNode;

    constructor({ flameChartPlugin }) {
        super();

        this.height = 100;
        flameChartPlugin.on('select', this.handleNodeSelect.bind(this));
    }

    override init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.interactionsEngine.on('select', this.handleSelect.bind(this));
        this.renderEngine.setFlexible();
        this.renderEngine.collapse();
    }

    override render() {
        if (this.currentNode) {
            const { width, height } = this.renderEngine;
            console.log('width height');
            console.log(width);
            console.log(height);
            // Cover background with white.
            this.renderEngine.setCtxColor('rgba(255, 255, 255, 1)');
            this.renderEngine.fillRect(0, 0, width, height);
            // Add outline to box
            this.renderEngine.addStrokeToRenderQueue('rgba(0, 0, 1, 1)', 0, 0, width, height);
            // Add text to box
            this.renderEngine.addTextToRenderQueue(this.currentNode.source.name, 0, height / 2.0, width);
        }
    }

    handleSelect(region) {
        console.log('selected');
        console.log(region);
        this.renderEngine.collapse();
        this.renderEngine.parent.recalcChildrenSizes();
        this.renderEngine.parent.render();
        console.log('collapsed');
    }

    handleNodeSelect(selected) {
        console.log('handling node select');
        console.log(selected);
        this.currentNode = selected;
        this.renderEngine.expand();
        this.renderEngine.parent.recalcChildrenSizes();
        this.renderEngine.parent.render();
    }
}
