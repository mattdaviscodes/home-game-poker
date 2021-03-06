import {ActionText} from "../classes/Action";
import CardManager from "../managers/CardManager";
import ChipManager from "../managers/ChipManager";
import Nameplate from "../classes/Nameplate";

class Player {
    constructor(game, chipConfig) {
        this.game = game;
        this.chipConfig = chipConfig;

        this.id = null;
        this.userId = null;
        this.balance = null;
        this.sittingOut = null;
        this.seat = null;
        this.name = null;
        this.roundBet = 0;  // Sum bets by player in current betting round

        this.isDealer = false;
        this.isNext = false;
        this.isUser = false;

        this.displayGroup = this.game.add.group();
        this.display = {
            nameplate: null,
            cards: null,
            cardsMask: null,
            chips: null
        };

        this.cards = new CardManager(this.game);
        this.chips = new ChipManager(this.game, "chips", this.game.config.denoms);
        this.nameplate = new Nameplate(this.game, 0, 0, "nameplate");
    }

    initialize(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.balance = data.balance;
        this.sittingOut = data.sittingOut;
        this.seat = data.seat;
        this.name = data.name;
        this.isUser = data.isUser;

        this.cards.initialize(2);
    }

    initializeDisplay() {
        this.display.nameplate = this.nameplate;
        this.display.nameplate.initializeDisplay();

        this.display.cards = this.cards.displayGroup;
        this.display.cards.x = this.display.nameplate.centerX;
        this.hideCards();

        this.display.cardsMask = this.createCardsMask();
        this.display.cardsMask.bottom = this.display.nameplate.top;
        this.cards.mask = this.display.cardsMask;

        this.chips.initializeDisplay();
        this.display.chips = this.chips.displayGroup;
        this.display.chips.x = this.chipConfig[this.seat].x;
        this.display.chips.y = this.chipConfig[this.seat].y;

        this.displayGroup.add(this.chips.displayGroup);
        this.displayGroup.add(this.display.cards);
        this.displayGroup.add(this.display.cardsMask);
        this.displayGroup.add(this.display.nameplate);

        this.updateDisplay();
    }

    updateDisplay() {
        this.display.nameplate.name = this.name;
        this.display.nameplate.balance = this.balance;
        this.display.nameplate.frameName = this.isNext ? "red" : "base";
    }

    update(data, updateChips = true) {
        // TODO - Flesh out the rest of the data -- do I like this method?
        this.balance = data.balance === undefined ? this.balance : data.balance;
        this.isDealer = data.isDealer === undefined ? this.isDealer : data.isDealer;
        this.isNext = data.isNext === undefined ? this.isNext : data.isNext;
        this.roundBet = data.roundBet === undefined ? this.roundBet : data.roundBet;
        if (updateChips) {
            this.chips.setValue(this.roundBet);
        } else {
            this.chips.value = this.roundBet;
        }
        this.updateDisplay();
    }

    action(data) {
        this.update({
            balance: data.playerBalance,
            roundBet: data.playerRoundBet
        });

        let actionText = ActionText[data.actionType];

    }

    createCardsMask() {
        let height = this.cards.cards[0].height;
        let width = this.nameplate.width;
        let mask = this.game.add.graphics(0, 0);
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, width, height);
        return mask;
    }

    animateDeal() {
        const showTween = this.game.add.tween(this.display.cards).to({y: -this.nameplate.height / 2}, 500, Phaser.Easing.Quartic.Out, true);

        showTween.onComplete.add(() => {
            const cardPositions = this.calcCardPositions();
            for (let i = 0; i < this.cards.length; i++) {
                this.game.add.tween(this.cards.cards[i]).to({x: cardPositions[i]}, 500, Phaser.Easing.Quartic.Out, true);
            }
        }, this);
    }

    animateFold() {
        for (let i = 0; i < this.cards.length; i++) {
            this.game.add.tween(this.cards.cards[i]).to({x: 0}, 500, Phaser.Easing.Quartic.Out, true);
        }

        const hideTween = this.game.add.tween(this.display.cards).to({top: this.display.nameplate.top}, 500, Phaser.Easing.Quartic.Out);
        this.game.time.events.add(500, () => {
            hideTween.start();
        }, this);

        return hideTween.onComplete;
    }

    hideCards() {
        for (let i = 0; i < this.cards.length; i++) {
            this.cards.cards[i].x = 0;
        }
        this.display.cards.top = this.display.nameplate.top;
    }

    showCards() {
        const cardPositions = this.calcCardPositions();
        for (let i = 0; i < this.cards.length; i++) {
            this.cards.cards[i].x = cardPositions[i];
        }
        this.display.cards.y = -this.nameplate.height / 2;
    }

    /**
     * @summary Calculate the final positions of all cards in hand
     *
     * NOTE TO ME: Don't fuck with this. It took a long time to get right.
     *
     * The cards need to be positioned correctly both in relation to
     * themselves (staggered evenly) and also in relation to the nameplate.
     * Doing the latter by centering the cards' display group on the nameplate
     * would have been much easier, but that way made animating the card
     * spread nearly impossible.
     *
     * @returns {number[]}
     */
    calcCardPositions() {
        if (!this.cards.length) {
            return [];
        }

        let positions = [];
        const cardWidth = this.cards.cards[0].width;
        const cardArea = this.display.nameplate.width * 0.9;
        const totalWidth = cardWidth * this.cards.length;
        const totalOverflow = totalWidth - cardArea;
        const cardOffset = totalOverflow / (this.cards.length - 1);
        for (let i = 0; i < this.cards.length; i++) {
            // Space cards evenly
            let pos = cardWidth * i - cardOffset * i;

            // Center cards on nameplate
            pos -= cardArea / 2 - cardWidth / 2;

            positions.push(pos);
        }
        return positions;
    }
}

export default Player;
