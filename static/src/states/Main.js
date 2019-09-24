import Action from "../classes/Action.js";
import CardManager from "../managers/CardManager";
import Panel from "../classes/Panel";
import PlayerManager from "../managers/PlayerManager";
import Pot from "../classes/Pot";
import Poker from "../Poker";
import SSE from "../SSE";

class Main extends Phaser.State {
    init() {
        this.table_sse = new SSE(this.game, this.game.initialData.tableSSEUrl);
        this.user_sse = new SSE(this.game, this.game.initialData.userSSEUrl);

        window.addEventListener("unload", () => {
            this.game.controller.disconnectBeacon();
        }, false);
    }

    create() {
        this.background = this.game.add.image(0, 0, "background");
        this.dealBtn = this.makeBtn(100, 100, "deal", this.game.textures.whiteSquare, this.deal);

        this.game.players = new PlayerManager(this.game);
        this.game.players.initialize(this.game.initialData.players);
        this.game.players.displayGroup.centerX = this.game.world.centerX;
        this.game.players.displayGroup.centerY = this.game.world.centerX / 6;

        this.game.board = new CardManager(this.game);
        this.game.board.initialize(5);
        this.game.board.displayGroup.centerX = this.game.world.centerX;
        this.game.board.displayGroup.centerY = this.game.world.centerY;

        this.game.pot = new Pot(this.game);
        this.game.pot.initializeDisplay();
        this.game.pot.sprite.centerX = this.game.world.centerX;
        this.game.pot.sprite.centerY = this.game.world.centerY - 140;

        // TODO - These should go somewhere else. Maybe in Pot?
        this.game.roundBet = 0;
        this.game.roundRaise = 0;

        this.game.panel = new Panel(this.game, "panel");
        this.game.panel.initialize();
        this.game.panel.setBets([25, 50, 75, 100]);
        this.game.panel.setBetAmt(this.game.panel.bets[0]);
        this.game.panel.setMinDenom(this.game.rules.minDenom);
        this.game.panel.displayGroup.x = this.game.config.panel.pos.x;
        this.game.panel.displayGroup.y = this.game.config.panel.pos.y;
        this.registerListeners();

        this.table_sse.addListener("newHand", event => {
            let data = JSON.parse(event.data);
            console.log("newHand: ", data);
            this.game.board.reset();
            for (let i = 0; i < this.game.players.players.length; i++) {
                let player = this.game.players.players[i];
                player.cards.reset();
                player.update({
                    isDealer: player.id === data.dealer,
                    isNext: player.id === data.next,
                    roundBet: 0
                });
            }
            // TODO - userPlayer.id will fail for watchers
            let userPlayerNext = data.next === this.game.players.userPlayer.id;
            if (userPlayerNext) {
                let bets = this.generateBets(this.game.players.userPlayer.roundBet, this.game.players.userPlayer.balance);
                this.game.panel.setBets(bets);
            }
            this.game.panel.setEnabled(userPlayerNext);
            this.game.pot.setAmount(0);
            this.game.roundBet = 0;
        });
        this.table_sse.addListener("newRound", event => {
            let data = JSON.parse(event.data);
            console.log("newRound: ", data);
            this.game.panel.setSecondaryAction(Action.CHECK);
            for (let i = 0; i < this.game.players.players.length; i++) {
                this.game.players.players[i].update({roundBet: 0});
            }
            this.game.roundBet = 0;
        });
        this.table_sse.addListener("action", event => {
            let data = JSON.parse(event.data);
            console.log("action: ", data);
            this.game.board.setCardNames(data.board);
            this.game.players.getById(data.playerId).update({
                balance: data.playerBalance,
                isNext: false,
                roundBet: data.playerRoundBet
            });
            this.game.players.getById(data.next).update({isNext: true});
            this.game.pot.setAmount(data.pot);
            this.game.roundBet = data.roundBet;
            this.game.roundRaise = data.roundRaise;

            let userPlayerNext = data.next === this.game.players.userPlayer.id;
            if (userPlayerNext) {
                let bets = this.generateBets(this.game.players.userPlayer.roundBet, this.game.players.userPlayer.balance);
                this.game.panel.setBets(bets);
            }
            if (data.actionType === Action.BET) {
                this.game.panel.setSecondaryAction(Action.FOLD);
            }
            this.game.panel.setEnabled(userPlayerNext);
        });
        this.table_sse.addListener("handComplete", event => {
            let data = JSON.parse(event.data);
            console.log("handComplete: ", data);
            for (let i = 0; i < data.winners.length; i++) {
                let winner = data.winners[i];
                this.game.players.getById(winner.id).update({balance: winner.balance});
            }
        });
        this.table_sse.addListener("newPlayer", (event) => {
            let data = JSON.parse(event.data);
            console.log("newPlayer: ", data);
        }, this);

        this.user_sse.addListener("newHand", (event) => {
            let data = JSON.parse(event.data);
            console.log("newHand: ", data);
            for (let i = 0; i < this.game.players.players.length; i++) {
                if (this.game.players.players[i].id === this.game.initialData.playerId) {
                    this.game.players.players[i].cards.setCardNames(data.holdings);
                }
            }
        }, this);
        this.user_sse.addListener("newPlayer", (event) => {
            let data = JSON.parse(event.data);
            console.log("newPlayer: ", data);
            this.game.controller.setToken(data.token);
        }, this);
    }

    registerListeners() {
        this.game.panel.primaryClicked.add(this.handleAction, this);
        this.game.panel.secondaryClicked.add(this.handleAction, this);
    }


    /**
     * @summary Route actions to controller requests
     * @param {number} action - The action to be requested, defined in Action.js
     */
    handleAction(action) {
        switch (action) {
            case Action.FOLD:
                this.game.controller.fold();
                break;
            case Action.CHECK:
                this.game.controller.check();
                break;
            case Action.BET:
                this.game.controller.bet(this.game.panel.betAmt);
                break;
            default:
                console.warn("Invalid Action Type: " + action);
        }
    }

    update() {

    }

    makeBtn(x, y, text, texture, callback) {
        let btn = this.game.add.button(x, y, texture, callback, this);
        btn.anchor.setTo(0.5);

        let btnText = this.game.add.text(0, 0, text);
        btnText.anchor.setTo(0.5);
        btn.addChild(btnText);
        btn.text = btnText;

        return btn;
    }

    deal() {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/tables/' + this.game.initialData.tableName + '/deal/');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            tableName: initialData.tableName,
        }));
    }

    generateBets(playerRoundBet, playerBalance) {
        console.log(playerRoundBet, playerBalance, this.game.roundBet, this.game.roundRaise);
        return Poker.generateBets(25, 50, this.game.roundBet, playerRoundBet, this.game.roundRaise, playerBalance);
    }
}

export default Main;