import Player from "../classes/Player";

class PlayerManager {
    constructor(game, seatConfig) {
        this.game = game;
        this.seatConfig = seatConfig;

        this.players = [];  // Direct access to the Player objects
        this.userPlayer = null;  // The user's player object, if available
        this.nextPlayer = null;  // The player that the game expects to act next

        // Contains all display elements for all players in the game
        this.displayGroup = this.game.add.group();
    }

    initialize(playerData) {
        for (let i = 0; i < playerData.length; i++) {
            this.newPlayer(playerData[i]);
        }
    }

    newPlayer(playerData) {
        let player = new Player(this.game, this);
        player.initialize(playerData);
        player.initializeDisplay();

        player.displayGroup.x = this.seatConfig[playerData.seat].x;
        player.displayGroup.y = this.seatConfig[playerData.seat].y;

        this.players.push(player);
        this.displayGroup.add(player.displayGroup);

        if (playerData.isUser === true) {
            this.userPlayer = player;
        }
    }

    getById(id) {
        // TODO - Do this without iterating -- build map on init?
        // TODO - Should this ever return null?
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id === id) {
                return this.players[i];
            }
        }
        return null;
    }

    /**
     * @summary Get a list of all occupied seats at the table
     * @returns {number[]} - The IDs of occupied seats
     */
    getOccupiedSeats() {
        let occupiedSeats = [];
        for (let i = 0; i < this.players.length; i++) {
            occupiedSeats.push(this.players[i].seat);
        }
        return occupiedSeats;
    }
}

export default PlayerManager;