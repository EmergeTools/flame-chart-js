import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import { Data } from '../types';
import UIPlugin from './ui-plugin';

export default class DetailsBarPlugin extends UIPlugin {
    name = 'detailsBarPlugin';

    height: number;
    data: Data;

    constructor({ data }) {
        super();

        this.height = 300;
        this.data = data;
    }

    override init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.renderEngine.setFlexible();
        this.interactionsEngine.on('select', this.handleSelect.bind(this));
    }

    override render() {
        const { width, height } = this.renderEngine;
        console.log('width height');
        console.log(width);
        console.log(height);
        this.renderEngine.setCtxColor('rgba(0, 0, 255, 1)');
        this.renderEngine.fillRect(0, 0, width, height);
    }

    handleSelect(region) {
        console.log('selected');
        console.log(region);
        this.renderEngine.collapse();
        this.renderEngine.parent.recalcChildrenSizes();
        this.renderEngine.parent.render();
        console.log('collapsed');
    }
}
