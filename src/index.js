import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { useState } from "react";

function Word(props) {
    return (
        <p className='word'>
            {props.word.word}
        </p>
    );
}

class WordList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: {},
            seconds: 600,
        };
        this.timer = 0;
        this.countDown = this.countDown.bind(this);
        this.upScore = this.upScore.bind(this);
    }

    secondsToTime(secs) {
        let hours = Math.floor(secs / (60 * 60));

        let divisor_for_minutes = secs % (60 * 60);
        let minutes = Math.floor(divisor_for_minutes / 60);

        let divisor_for_seconds = divisor_for_minutes % 60;
        let seconds = Math.ceil(divisor_for_seconds);

        let obj = {
            "h": hours,
            "m": minutes,
            "s": seconds
        };
        return obj;
    }

    componentDidMount() {
        this.props.shuffleCurrentList();
        this.setState({ seconds: this.props.secondsPerRound });
        let timeLeftVar = this.secondsToTime(this.state.seconds);
        this.setState({ time: timeLeftVar });
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    countDown() {
        // Remove one second, set state so a re-render happens.
        let seconds = this.state.seconds - 1;
        this.setState({
            time: this.secondsToTime(seconds),
            seconds: seconds,
        });

        // TIMEOUT
        if (seconds === 0) {
            clearInterval(this.timer);
            this.props.setShowGame();
        }
    }

    upScore() {
        this.props.addScore(this.props.currentTeam);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.props.flipCurrentTeam();
    }

    render() {
        if (this.props.list.length === 0) {
            return null;
        }
        return (<div className='game-board'>
            <div          //REALMENTE EL ONCLICK DEBERIA DE ESTAR EN EL COMPONENTE WORD, ES DECIR SE LE PASA LA FUNCION A ÉL
                className='word-list'
                onClick={this.upScore}>
                <Word word={this.props.list[0]} />
            </div>
            <div className='timer'>
                {this.state.time.h}:{this.state.time.m}:{this.state.time.s}
            </div>
            <div className='current-team'>
                <h3>Es tu turno {this.props.currentTeam}</h3>
                <h2>Ronda {this.props.round}</h2>
            </div>
        </div>
        );
    }
}

function WordForm(props) {
    const jugadores = props.players;
    const palabrasPorJugadorCount = props.wordsPerPlayer;

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [inputValues, setInputValues] = useState(
        Array(palabrasPorJugadorCount).fill("")
    );

    function handleNextPlayer() {
        setCurrentPlayerIndex((currentPlayerIndex + 1));
        setInputValues(Array(palabrasPorJugadorCount).fill(""));
        if (currentPlayerIndex === jugadores.length - 1) {
            props.gamePrepared();
        }
    }

    function handleInputChange(index, value) {
        setInputValues((prevValues) => {
            const newValues = [...prevValues];
            newValues[index] = value;
            return newValues;
        });
    }

    function handleSubmit(event) {
        event.preventDefault();
        const playerWords = inputValues.map((word) => ({
            word: word,
            player: currentPlayer,
        }));
        props.addWords(playerWords);
        handleNextPlayer();
    }

    const currentPlayer = jugadores[currentPlayerIndex];

    const inputs = [];

    for (let i = 0; i < palabrasPorJugadorCount; i++) {
        inputs.push(
            <div key={i}>
                <label className='form-label'>
                    Palabra {i + 1}:
                    <input
                        className='form-control'
                        type="text"
                        value={inputValues[i]}
                        onChange={(e) => handleInputChange(i, e.target.value)}
                    />
                </label>
            </div>
        );
    }

    return (
        <div className="word-form text-center">
            <form onSubmit={handleSubmit}>
                <div className='word-form-2'>
                    <h3>Introduce las palabras <strong>{currentPlayer}</strong></h3>
                    {inputs}
                    <button className='btn btn-primary' type="submit">Siguiente jugador</button>
                </div>

            </form>
        </div>

    );
}

function TeamForms(props) {
    const [teams, setTeams] = useState({
        team1: {
            score: 0,
            players: ["", ""]
        },
        team2: {
            score: 0,
            players: ["", ""]
        }
    });

    const handleAddPlayer = (team) => {
        setTeams({
            ...teams,
            [team]: {
                score: teams[team].score,
                players: [...teams[team].players, ""]
            }
        });
    };

    const handleRemovePlayer = (team, index) => {
        if (teams[team].players.length === 1) {
            return;
        }

        const newPlayers = [...teams[team].players];
        newPlayers.splice(index, 1);

        setTeams({
            ...teams,
            [team]: {
                score: teams[team].score,
                players: newPlayers
            }
        });
    };

    const handleChange = (event, team, index) => {
        const newPlayers = [...teams[team].players];
        newPlayers[index] = event.target.value;

        setTeams({
            ...teams,
            [team]: {
                score: teams[team].score,
                players: newPlayers
            }
        });
    };

    const submitTeams = () => {
        props.setTeamsGame(teams);
        props.gamePrepared();
    }

    return (
        <div className='pre-game d-grid gap-5 m-5'>
            <div className="team-form text-center">
                <div className="team1-form">
                    <h3>Equipo 1</h3>
                    {teams.team1.players.map((player, i) => {
                        return (
                            <div className="box">
                                <div className="player-input p-1">
                                    <input
                                        className="form-control text-center player-input-form"
                                        name="team1"
                                        type="text"
                                        placeholder={"Jugador " + (i + 1)}
                                        value={player}
                                        onChange={(event) => handleChange(event, "team1", i)}
                                    />
                                    {teams.team1.players.length >= 3 && (
                                        <button className="btn btn-close mr10" onClick={() => handleRemovePlayer("team1", i)} aria-label="Eliminar jugador"></button>
                                    )}
                                </div>


                                {teams.team1.players.length - 1 === i && (
                                    <button className="btn-add btn btn-primary" onClick={() => handleAddPlayer("team1")}>Añadir jugador</button>
                                )}


                            </div>
                        );
                    })}
                </div>
                <div className="team2-form">
                    <h3>Equipo 2</h3>
                    {teams.team2.players.map((player, i) => {
                        return (
                            <div className="box">
                                <div className='player-input p-1'>
                                    <input
                                        className="form-control text-center player-input-form"
                                        name="team2"
                                        type="text"
                                        placeholder={"Jugador " + (i + 1)}
                                        value={player}
                                        onChange={(event) => handleChange(event, "team2", i)}
                                    />
                                    {teams.team2.players.length >= 3 && (
                                        <button className="btn btn-close mr10" onClick={() => handleRemovePlayer("team2", i)} aria-label="Eliminar jugador"></button>
                                    )}
                                </div>

                                {teams.team2.players.length - 1 === i && (
                                    <button className="btn-add btn btn-primary" onClick={() => handleAddPlayer("team2")}>Añadir jugador</button>
                                )}

                            </div>

                        );
                    })}
                </div>
            </div >
            <div className='game-settings'>
                <div className='words-per-player'>

                    <h3>Palabras por jugador</h3>
                    <input className="form-control " type="number" defaultValue="3" min="1" max="10" onChange={(event) => props.setWordsPerPlayer(event.target.value)} /></div>


                <div className='seconds-per-round'>

                    <h3>Segundos por ronda</h3>
                    <input className='form-control' type="number" defaultValue="45" min="1" max="600" onChange={(event) => props.setSecondsPerRound(event.target.value)} />


                </div>
            </div>
            <div className='submit-teams'>
                <button className="btn btn-primary" onClick={submitTeams}>Añadir palabras</button>
            </div>
        </div >
    );
}


class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            secondsPerRound: 45,
            wordsPerPlayer: 3,
            gamePrepared: 0,
            round: 0,
            startTeam: null,
            currentTeam: null,
            showGame: false,
            teams: { team1: { score: 0, players: [] }, team2: { score: 0, players: [] } },
            words: [],
            currentList: [],
        };
        this.addScore = this.addScore.bind(this);
        this.startGame = this.startGame.bind(this);
        this.setShowGame = this.setShowGame.bind(this);
        this.flipCurrentTeam = this.flipCurrentTeam.bind(this);
        this.nextRound = this.nextRound.bind(this);
        this.nextTeam = this.nextTeam.bind(this);
        this.addWords = this.addWords.bind(this);
        this.setTeamsGame = this.setTeamsGame.bind(this);
        this.setWordsPerPlayer = this.setWordsPerPlayer.bind(this);
        this.gamePrepared = this.gamePrepared.bind(this);
        this.setSecondsPerRound = this.setSecondsPerRound.bind(this);
        this.shuffleCurrentList = this.shuffleCurrentList.bind(this);
        this.shuffleArray = this.shuffleArray.bind(this);
    }

    shuffleArray = array => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    shuffleCurrentList() {
        let currentList = this.state.currentList;
        this.shuffleArray(currentList);
        this.setState({ currentList: currentList });
    }

    setSecondsPerRound(n) {
        this.setState({ secondsPerRound: n });
    }

    setWordsPerPlayer(n) {
        this.setState({ wordsPerPlayer: n });
    }


    setTeamsGame(teams) {
        this.setState({ teams: teams });
    }

    addWords(words) {
        this.setState({ words: [...this.state.words, ...words] });
    }

    flipCurrentTeam() {
        this.setState({ currentTeam: this.state.currentTeam === 'Equipo 1' ? 'Equipo 2' : 'Equipo 1' });
    }

    setShowGame() {
        this.state.showGame ? this.setState({ showGame: false }) : this.setState({ showGame: true });
    }

    addScore(team) {
        if (team === 'Equipo 1') {
            this.setState({
                teams: {
                    team1: {
                        score: this.state.teams.team1.score + 1,
                        players: this.state.teams.team1.players
                    },
                    team2: {
                        score: this.state.teams.team2.score,
                        players: this.state.teams.team2.players
                    }
                }
            });
        } else {
            this.setState({
                teams: {
                    team1: {
                        score: this.state.teams.team1.score,
                        players: this.state.teams.team1.players
                    },
                    team2: {
                        score: this.state.teams.team2.score + 1,
                        players: this.state.teams.team2.players
                    }
                }
            });
        }
        let currentList = this.state.currentList;
        currentList.shift();
        this.setState({ currentList: currentList });
        if (currentList.length === 0) {
            this.nextRound();
        }

    }

    startGame() {
        this.gamePrepared();
        this.setState({ round: 1 });
        this.setState({ currentList: this.state.words.slice() });
        let startTeam = (Math.random() < 0.5) ? 'Equipo 1' : 'Equipo 2';
        this.setState({ startTeam: startTeam });
        this.setState({ currentTeam: startTeam });
        this.setState({ showGame: true });
    }

    gamePrepared() {
        this.setState({ gamePrepared: this.state.gamePrepared + 1 });
    }

    nextRound() {
        this.setState({ round: this.state.round + 1 });
        this.setState({ currentList: this.state.words.slice() });
        this.setState({ startTeam: this.state.startTeam === 'Equipo 1' ? 'Equipo 2' : 'Equipo 1' });
        this.setState({ showGame: false })
    }

    nextTeam() {
        this.setState({ showGame: true });
    }

    render() {
        return (
            <div className="game">
                <div className='board'>
                    {(this.state.gamePrepared === 0) ? <TeamForms setTeamsGame={this.setTeamsGame} gamePrepared={this.gamePrepared} setWordsPerPlayer={this.setWordsPerPlayer} setSecondsPerRound={this.setSecondsPerRound} /> : null}
                    {(this.state.gamePrepared === 1) ? <WordForm players={this.state.teams.team1.players.concat(this.state.teams.team2.players)} wordsPerPlayer={this.state.wordsPerPlayer} addWords={this.addWords} gamePrepared={this.gamePrepared} startGame={this.startGame} /> : null}
                    {(this.state.gamePrepared === 2) ? <StartGame StartGame={this.startGame} /> : null}
                    {(this.state.round > 0 && this.state.showGame === false) ? <NextTeam nextTeam={this.nextTeam} round={this.state.round} /> : null}
                    {this.state.showGame ? <WordList list={this.state.currentList} shuffleCurrentList={this.shuffleCurrentList} addScore={this.addScore} setShowGame={this.setShowGame} flipCurrentTeam={this.flipCurrentTeam} currentTeam={this.state.currentTeam} nextRound={this.nextRound} round={this.state.round} secondsPerRound={this.state.secondsPerRound} /> : null}
                </div>
                <div className="container-fluid game-info">
                    <div className='row p-3'>
                        <div className='score-team col'>
                            <span>Equipo 1: <strong className='score'>{this.state.teams.team1.score} puntos</strong></span>

                        </div>
                        <div className='score-team col'>
                            <span>Equipo 2: <strong className='score'>{this.state.teams.team2.score} puntos</strong></span>

                        </div>
                    </div>

                </div>
            </div>

        );
    }
}


function StartGame(props) {
    return (
        <div className='start-game-btn'>
            <button className='start-button btn btn-primary' onClick={props.StartGame}>Start Game</button>
        </div>
        
    );
}


function NextTeam(props) {
    return (
        <div className='next-team-btn'>
            <h1>Ronda {props.round}</h1>
            <button className='btn btn-primary next-team-button' onClick={props.nextTeam}>Next team</button>
        </div>

    );
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
