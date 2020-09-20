// Title of the game
const GameTitle = 'TicTacToe v.3.5';

// 'Player' of the game
const Player = {
  X: 1,
  O: 2 };


// The player name
const PlayerName = ['', 'X', 'O'];

// AI Difficulty
const Difficulty = {
  Easy: 1,
  Medium: 2,
  Hard: 3 };


// Match count (used for AI)
const Matches = {
  Two: 2,
  One: 4 };


// Available combinations for the game
const Combinations = [
[0, 1, 2],
[3, 4, 5],
[6, 7, 8],
[0, 3, 6],
[1, 4, 7],
[2, 5, 8],
[0, 4, 8],
[2, 4, 6]];


class TicTacToe extends React.Component {
  // Class constructor
  constructor(props) {
    super(props);

    // React state
    this.state = {
      buttons: [],
      aiPlayer: 0,
      aiDifficulty: 0,
      turn: 0,
      play: true,
      match: [],
      showDialog: true,
      winningPlayer: '',
      dialogStep: 0 };

  }

  // ReactJS componentDidMount() method to initialize
  componentDidMount() {
    this.initialize();
  }

  // Initialize the game
  async initialize() {
    await this.setState({ aiPlayer: 0 });
    await this.setState({ aiDifficulty: 0 });

    await this.playAgain();

    this.setState({ showDialog: true });
    this.setState({ dialogStep: 0 });
  }

  // Start the game with same settings
  async playAgain() {
    await this.setState({ buttons: [] });
    await this.setState({ turn: this.state.aiPlayer === Player.X ? Player.O : Player.X });
    await this.setState({ play: true });
    await this.setState({ match: [] });
    await this.setState({ winningPlayer: '' });
    await this.setState({ showDialog: false });
    await this.setState({ dialogStep: 4 });

    this.createMap();

    if (this.state.aiPlayer === Player.X) {
      this.robotMove();
    }
  }

  // Creates the tic tac toe map
  createMap() {
    let buttons = [];

    for (let i = 0; i < 9; i++) {
      buttons.push({
        player: 0,
        active: false,
        match: false });

    }

    this.setState({ buttons: buttons });
  }

  // Event when the tile is clicked
  tileClick(e) {
    if (this.state.play === true) {
      if (this.state.turn === this.state.aiPlayer) {
        return false;
      }

      let elm = e.target;

      this.humanMove(elm);
    }
  }

  // Proceed to next step of the dialog
  proceedToNext() {
    this.setState({ dialogStep: this.state.dialogStep + 1 });
  }

  // Choose the opponent to play with
  chooseOpponent(isRobot) {
    if (isRobot === true) {
      this.proceedToNext();
    } else
    {
      this.setState({ turn: Player.X });
      this.setState({ dialogStep: 4 });
      this.setState({ showDialog: false });
    }
  }

  // Choose your player (VS AI)
  choosePlayer(chosenPlayer) {
    this.setState({ aiPlayer: chosenPlayer === Player.X ? Player.O : Player.X });

    this.proceedToNext();
  }

  // Choose the AI difficulty
  async chooseDifficulty(difficulty) {
    await this.setState({ aiDifficulty: difficulty });

    await this.setState({ dialogStep: 4 });
    await this.setState({ showDialog: false });

    if (this.state.aiPlayer === Player.X) {
      this.robotMove();
    }
  }

  // Analyze the provided combination if the player gets
  // 3 consecutives. For AI purposes, +2 of each was added
  // if has 2 combinations. +4 if has 1 combination.
  analyzeCombination(open) {
    open.sort();

    let countX = 0;
    let countO = 0;

    for (let i in open) {
      if (open[i] === Player.X) {
        countX++;
      } else
      if (open[i] === Player.O) {
        countO++;
      }
    }

    if (countX === 3) {
      return Player.X;
    } else
    if (countO === 3) {
      return Player.O;
    } else
    if (countX === 2) {
      return Player.X + Matches.Two;
    } else
    if (countO === 2) {
      return Player.O + Matches.Two;
    } else
    if (countX === 1) {
      return Player.X + Matches.One;
    } else
    if (countO === 1) {
      return Player.O + Matches.One;
    } else
    {
      return null;
    }
  }

  // Create array of opened combination
  createOpened(combination) {
    let open = [];

    for (let i = 0; i < combination.length; i++) {
      let index = combination[i];

      open.push(this.state.buttons[index].player);
    }

    return open;
  }

  // Find the combinations of the opened tiles
  findCombination() {
    for (let i = 0; i < Combinations.length; i++) {
      let combination = Combinations[i];
      let open = this.createOpened(combination);
      let analysis = this.analyzeCombination(open);

      if (analysis === Player.X || analysis === Player.O) {
        this.setState({ play: false });
        this.setState({ match: combination });

        return true;
      }
    }

    return false;
  }

  // Get the buttons that aren't yet opened
  getFreeButtons() {
    let freeButtons = [];

    for (let i = 0; i < this.state.buttons.length; i++) {
      if (this.state.buttons[i].match === true) {
        continue;
      }

      if (this.state.buttons[i].active === false) {
        freeButtons.push(i);
      }
    }

    return freeButtons;
  }

  // Insert the possible turn of AI
  robotInsertTurn(combination) {
    let turn = null;

    for (let j = 0; j < combination.length; j++) {
      if (this.state.buttons[combination[j]].player === 0) {
        turn = combination[j];

        break;
      }
    }

    return turn;
  }

  // Random move by AI
  robotRandom() {
    let freeButtons = this.getFreeButtons();
    let random = Math.round(Math.random() * (freeButtons.length - 1));

    if (random >= 0) {
      return freeButtons[random];
    } else
    {
      return null;
    }
  }

  // Find combination for AI move
  robotCombinaton(selectedMatches) {
    let turn = null;

    for (let i = 0; i < Combinations.length; i++) {
      let combination = Combinations[i];
      let open = this.createOpened(combination);
      let analysis = this.analyzeCombination(open);

      // First priority is 2 matches, then 1
      if (analysis === selectedMatches) {
        turn = this.robotInsertTurn(combination);

        break;
      }
    }

    return turn;
  }

  // Attack move by AI
  robotAttack(tileIndex) {
    if (tileIndex === null) {
      tileIndex = this.robotCombinaton(this.state.aiPlayer + Matches.Two);
    }

    if (tileIndex === null) {
      tileIndex = this.robotCombinaton(this.state.aiPlayer + Matches.One);
    }

    return tileIndex;
  }

  // Defend move by AI
  robotDefend() {
    let tileIndex = null;
    let human = this.state.aiPlayer === Player.X ? Player.O : Player.X;

    tileIndex = this.robotCombinaton(human + Matches.Two);

    return tileIndex;
  }

  // Move of the player (AI)
  robotMove() {
    if (this.state.turn === this.state.aiPlayer) {
      let tileIndex = null;

      switch (this.state.aiDifficulty) {
        case Difficulty.Easy:
          tileIndex = this.robotRandom();

          break;
        case Difficulty.Medium:
          tileIndex = this.robotAttack(tileIndex);

          if (tileIndex === null) {
            tileIndex = this.robotRandom();
          }

          break;
        case Difficulty.Hard:
          tileIndex = this.robotCombinaton(this.state.aiPlayer + Matches.Two);

          if (tileIndex === null) {
            tileIndex = this.robotDefend();
          }

          if (tileIndex === null) {
            tileIndex = this.robotCombinaton(this.state.aiPlayer + Matches.One);
          }

          if (tileIndex === null) {
            tileIndex = this.robotRandom();
          }

          break;}


      if (tileIndex !== null) {
        this.makeDecision(tileIndex);
      }
    }
  }

  // Move of the player (human)
  async humanMove(elm) {
    if (!elm.classList.contains('active')) {
      let tileIndex = elm.dataset.tile;

      await this.makeDecision(tileIndex);

      if (this.state.aiPlayer === this.state.turn) {
        this.robotMove();
      }
    }
  }

  // Make decision on rendering the board
  async makeDecision(tileIndex) {
    let buttons = this.state.buttons;

    if (tileIndex !== null) {
      buttons[tileIndex].active = true;
      buttons[tileIndex].player = this.state.turn;
    }

    this.setState({ buttons: buttons });

    if (this.findCombination() === true) {
      this.decideGameWin();

      return;
    }

    if (this.findAnotherTile() === false) {
      this.setState({ showDialog: true });

      return;
    }

    if (this.state.turn === Player.X) {
      await this.setState({ turn: Player.O });
    } else
    if (this.state.turn === Player.O) {
      await this.setState({ turn: Player.X });
    }
  }

  // Changes the buttons color into match
  changeButtonsToMatch() {
    let buttons = this.state.buttons;

    for (let i = 0; i < this.state.match.length; i++) {
      let j = this.state.match[i];

      buttons[j].match = true;
    }

    this.setState({ buttons: buttons });
  }

  // Find another available tile
  findAnotherTile() {
    let hasTile = false;

    for (let i = 0; i < this.state.buttons.length; i++) {
      if (this.state.buttons[i].active === false) {
        hasTile = true;

        break;
      }
    }

    return hasTile;
  }

  // Game win event
  decideGameWin() {
    this.changeButtonsToMatch();

    this.setState({ showDialog: true });
    this.setState({ winningPlayer: PlayerName[this.state.turn] });
  }

  // Render the value of each tiles
  renderTileValue(i) {
    if (this.state.buttons[i].player === Player.X) {
      return (
        React.createElement("div", { className: "turn turn-0" }));

    } else
    if (this.state.buttons[i].player === Player.O) {
      return (
        React.createElement("svg", { viewBox: "0 0 30 30", className: "turn turn-1" },
        React.createElement("circle", { fill: "transparent",
          stroke: "#d10827",
          "stroke-width": "3",
          r: "10", cx: "15", cy: "15" })));


    }
  }

  // Render the tiles
  renderTiles() {
    let tiles = [];

    for (let i = 0; i < this.state.buttons.length; i++) {
      let className = "tile";

      if (this.state.buttons[i].active === true) {
        className += " active";
      }

      if (this.state.buttons[i].match === true) {
        className += " match";
      }

      if (this.state.play === false) {
        className += " disabled";
      }

      tiles.push(
      React.createElement("button", {
        "data-tile": i,
        className: className,
        onClick: this.tileClick.bind(this) }, this.renderTileValue(i)));


    }

    return tiles;
  }

  // Render modal dialog boxes 
  renderModal() {
    if (this.state.dialogStep === 0) {
      return (
        React.createElement("div", { className: "dialog-box" },
        React.createElement("div", { className: "dialog-content" },
        React.createElement("p", { className: "text-bold" }, GameTitle),
        React.createElement("p", null, "Welcome to the example TicTacToe game I made."),
        React.createElement("p", null, "You may play this with your friend, or versus the computer.")),

        React.createElement("div", { className: "dialog-content" },
        React.createElement("button", { className: "btn tile",
          onClick: this.proceedToNext.bind(this) }, "Proceed to Game"))));




    } else
    if (this.state.dialogStep === 1) {
      return (
        React.createElement("div", { class: "dialog-box" },
        React.createElement("div", { class: "dialog-content" },
        React.createElement("p", { class: "text-bold" }, GameTitle),
        React.createElement("p", null, "Choose your opponent to play with.")),

        React.createElement("div", { class: "dialog-content" },
        React.createElement("button", { class: "btn tile",
          onClick: this.chooseOpponent.bind(this, false) }, "Friend"), " ",
        React.createElement("button", { class: "btn tile",
          onClick: this.chooseOpponent.bind(this, true) }, "Computer"))));




    } else
    if (this.state.dialogStep === 2) {
      return (
        React.createElement("div", { class: "dialog-box" },
        React.createElement("div", { class: "dialog-content" },
        React.createElement("p", { class: "text-bold" }, GameTitle),
        React.createElement("p", null, "Choose your player.")),

        React.createElement("div", { class: "dialog-content" },
        React.createElement("button", { class: "btn btn-turn tile",
          onClick: this.choosePlayer.bind(this, Player.X) },
        React.createElement("div", { class: "turn turn-0" })), " ",
        React.createElement("button", { class: "btn btn-turn tile",
          onClick: this.choosePlayer.bind(this, Player.O) },
        React.createElement("svg", { viewBox: "0 0 30 30",
          class: "turn turn-1" },
        React.createElement("circle", { fill: "transparent",
          stroke: "#d10827",
          "stroke-width": "3",
          r: "10", cx: "15", cy: "15" }))))));





    } else
    if (this.state.dialogStep === 3) {
      return (
        React.createElement("div", { class: "dialog-box" },
        React.createElement("div", { class: "dialog-content" },
        React.createElement("p", { class: "text-bold" }, GameTitle),
        React.createElement("p", null, "Choose the computer's difficulty.")),

        React.createElement("div", { class: "dialog-content" }),

        React.createElement("div", { class: "dialog-content" },
        React.createElement("button", { class: "btn tile",
          onClick: this.chooseDifficulty.bind(this, Difficulty.Easy) }, "Easy"), " ",
        React.createElement("button", { class: "btn tile",
          onClick: this.chooseDifficulty.bind(this, Difficulty.Medium) }, "Medium"), " ",
        React.createElement("button", { class: "btn tile",
          onClick: this.chooseDifficulty.bind(this, Difficulty.Hard) }, "Hard"))));




    } else
    if (this.state.dialogStep === 4) {
      let endMessage = '';

      if (this.state.winningPlayer !== '') {
        endMessage =
        React.createElement("p", null, "Player '",
        this.state.winningPlayer, "' won the game! Would you like to play again?");


      } else
      {
        endMessage =
        React.createElement("p", null, "The match is a draw! Would you like to play again?");



      }

      return (
        React.createElement("div", { class: "dialog-box" },
        React.createElement("div", { class: "dialog-content" },
        React.createElement("p", { class: "text-bold" }, "Game ended!"),
        endMessage),

        React.createElement("div", { class: "dialog-content" },
        React.createElement("button", { class: "btn tile",
          onClick: this.initialize.bind(this) }, "Start New"), " ",
        React.createElement("button", { class: "btn tile",
          onClick: this.playAgain.bind(this) }, "Play Again"))));




    }
  }

  // Method to render the ReactJS Component
  render() {
    let elms = [];

    elms.push(React.createElement("div", { className: "tiles" }, this.renderTiles()));

    let modalWindow = "modal-window";

    if (this.state.showDialog === true) {
      modalWindow += " shown";
    }

    elms.push(React.createElement("div", { className: modalWindow }, this.renderModal()));

    return elms;
  }}


ReactDOM.render(
React.createElement(TicTacToe, null),
document.querySelector('#tic_tac_toe'));