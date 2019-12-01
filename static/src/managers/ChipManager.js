import Util from "../Util";

class Tooltip {
    constructor(game, key, padding = 10) {
        this.game = game;
        this.key = key;
        this.padding = padding;

        this._text = "";

        this.displayGroup = this.game.add.group();
        this.display = {
            background: null,
            text: null
        }
    }

    initializeDisplay() {
        this.display.background = this.game.add.sprite(0, 0, this.key);
        this.display.background.anchor.setTo(0.5);

        this.display.text = this.game.add.text(0, 2, "");   // TODO - No magic numbers (leaving for now because fuck trying to position text vertically)
        this.display.text.setStyle({
            "font": "16pt Arial",
            "fill": "#FFFFFF"
        });
        this.display.text.anchor.setTo(0.5);

        this.displayGroup.add(this.display.background);
        this.displayGroup.add(this.display.text);
        this.displayGroup.visible = false;
    }

    rePos() {
        this.display.text.scale.setTo(1);
        const textArea = this.display.background.width - (this.padding * 2);
        if (this.display.text.width > textArea) {
            this.display.text.scale.setTo(textArea / this.display.text.width);
        }
    }

    set text(text) {
        this._text = text;
        this.display.text.text = text;
        this.rePos();
    }

    get text() {
        return this._text;
    }

    set visible(visible) {
        this.displayGroup.visible = visible;
    }
}

class ChipManager {
    constructor(game, key, values) {
        this.game = game;
        this.key = key;
        this.values = values;

        this.stackChips = true;
        this.colorUp = true;
        this.chips = [];
        this.pool = [];
        this.value = null;
        this.tooltip = new Tooltip(this.game, this.game.textures.textUnderlay);
        this.displayGroup = this.game.add.group();
        this.display = {
            chips: this.game.add.group(),
            tooltip: this.tooltip.displayGroup
        };
    }

    initializeDisplay() {
        this.tooltip.initializeDisplay();
        this.display.tooltip.y = this.display.tooltip.height;
        this.displayGroup.add(this.display.tooltip);
        this.displayGroup.add(this.display.chips);
        this.setValue(0);
    }

    getChip() {
        let chip = this.pool.pop();
        if (!chip) {
            chip = this.game.add.sprite(0, 0, this.key);
            chip.angle = this.game.rnd.integerInRange(-180, 180);   // Random rotation
            chip.anchor.setTo(0.5);

            chip.inputEnabled = true;
            chip.events.onInputOver.add(() => {this.tooltip.visible = true});
            chip.events.onInputOut.add(() => {this.tooltip.visible = false});
        }
        chip.revive();
        this.chips.push(chip);
        return chip;
    }

    setValue(value) {
        if (value === this.value) {
            return;
        }

        if (this.colorUp) {
            this.clear();
            this.value = value;
        } else {
            value -= this.value;
            this.value += value;
        }

        let yPos = 0;
        let valuesPtr = this.values.length - 1;
        while (value >= 25) {
            while (value < this.values[valuesPtr]) {
                valuesPtr--;
                if (valuesPtr === 0) {
                    break;
                }
            }
            let chip = this.getChip();
            chip.frameName = this.values[valuesPtr].toString();

            if (this.stackChips) {
                chip.y = yPos;
                yPos -= 5;
            } else {
                if (this.chips.length === 1) {
                    chip.x = 0;
                    chip.y = 0;
                } else {
                    let variation = this.displayGroup.width / 2;
                    chip.x = this.game.rnd.integerInRange(-variation, variation);
                    chip.y = this.game.rnd.integerInRange(-variation, variation);
                }
            }
            value -= this.values[valuesPtr];
            this.display.chips.addChild(chip);
        }

        this.tooltip.text = Util.parseCurrency(this.value);
    }

    clear() {
        let chip;
        while (chip = this.chips.pop()) {
            this.pool.push(chip);
            chip.kill();
        }
    }
}

export default ChipManager;