import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default function game_init(root) {
    ReactDOM.render(<Game />, root);
}

const level = 4;
const timer = 60;
const status = Object.freeze({"initial": 1, "playing": 2, "finished": 3, "failed": 4});

class Block extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        if (this.props.flipped || this.props.matched || this.props.gameStatus == status.failed || this.props.gameStatus == status.initial) {
            return;
        }

        const blockNum = this.props.blockNum;
        this.props.onBlockClicked(blockNum);
    }

    render() {
        // console.log("game status in block: " + this.props.gameStatus);
        let content = "";
        let blockClassName = "square-block";
        if (!this.props.flipped) {
            content = <div className="content">&nbsp;</div>
        } else {
            content = <div className="content">{this.props.value}</div>
        }

        if (this.props.matched) {
            blockClassName += " matched";
        } else if (this.props.gameStatus == status.failed || this.props.gameStatus == status.initial) {
            blockClassName += " disabled";
        } else {
            blockClassName += " enabled";
        }

        if (this.props.matched) {
            content = <div className="content">&#10003;</div>
        }

        return (
            <div className="col-md-3">
                <div className={blockClassName} onClick={this.handleClick}>
                    {content}
                </div>
            </div>
        );
    }
}


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.handleBlockClicked = this.handleBlockClicked.bind(this);
        this.state = {
            matchedBlocks: [],
            currentFlippedBlocks: []
        };
    }

    componentWillReceiveProps(nextProps) {
        // console.log("board will receive status: " + nextProps.gameStatus);
        if (this.props.blockValues !== nextProps.blockValues) {
            this.setState({
                matchedBlocks: [],
                currentFlippedBlocks: []
            });
        }
    }

    handleBlockClicked(blockNum) {
        let currentFlippedBlocks = this.state.currentFlippedBlocks;
        if (currentFlippedBlocks.length == 0) {
            currentFlippedBlocks.push(blockNum);
            this.setState({currentFlippedBlocks: currentFlippedBlocks});
        } else if (currentFlippedBlocks.length == 1) {
            currentFlippedBlocks.push(blockNum);
            this.setState({currentFlippedBlocks: currentFlippedBlocks});

            const blockValues = this.props.blockValues;
            if (blockValues[currentFlippedBlocks[0]] == blockValues[currentFlippedBlocks[1]]) {
                this.props.onBlocksMatched();
                setTimeout(() => {
                    let matchedBlocks = this.state.matchedBlocks.concat(currentFlippedBlocks);
                    this.setState({matchedBlocks: matchedBlocks, currentFlippedBlocks: []});
                }, 200);
                
            } else {
                this.props.onBlocksMismatched();
                setTimeout(() => {
                    this.setState({currentFlippedBlocks: []});
                }, 1000);
            }
        }
    }

    render() {
        // console.log("game status in board: " + this.props.gameStatus);
        const blockValues = this.props.blockValues;
        var rows = [];
        for (var i = 0; i < level; i++) {
            var cols = [];
            for (var j = 0; j < level; j++) {
                var index = i * level + j;
                const matched = this.state.matchedBlocks.includes(index) ? true : false;
                const flipped = this.state.currentFlippedBlocks.includes(index) ? true : false;
                cols.push(<Block 
                            key={index.toString()} 
                            blockNum={index} 
                            value={blockValues[index]} 
                            flipped={flipped} 
                            matched={matched} 
                            onBlockClicked={this.handleBlockClicked}
                            gameStatus={this.props.gameStatus} />);
            }
            rows.push(<div className="row" key={"0" + i.toString()}>{cols}</div>);
        }

        return (
            <div>
                {rows}
            </div>
        );
    }
}

function Caption(props) {
    const time = "00:" + (props.remainingTime < 10 ? "0" + props.remainingTime : props.remainingTime);
    return  <div>
                <h1>Memory Game</h1>
                <div className="alert alert-secondary" role="alert">
                    <p>Press start. Click a block and then try match it.</p>
                    <hr />
                    <div>
                        <p className="mb-0 score">
                            score: {props.score}
                        </p>
                        <p className="mb-0 timer">
                            {time}
                        </p>
                        <div className="clear-float"></div>
                    </div>
                </div>
            </div>
}

function StartButton(props) {
    let text = (props.status == status.initial ? "Start" : "Restart");
    let className = "btn btn-info btn-lg btn-block";
    return <button id="startButton" type="button" className={className} onClick={props.onStart}>{text}</button>
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.handleBlocksMatched = this.handleBlocksMatched.bind(this);
        this.handleBlocksMismatched = this.handleBlocksMismatched.bind(this);
        this.handleGameStart = this.handleGameStart.bind(this);
        this.state = {
            blockValues: generateRandomBlockValues(),
            status: status.initial,
            remainingBlocks: level * level,
            countDownTimer: 0,
            score: 0
        };
    }

    handleGameStart() {
        clearInterval(this.timerID);
        this.setState({
            blockValues: generateRandomBlockValues(),
            remainingBlocks: level * level,
            countDownTimer: timer,
            score: 0
        });
        this.setState({status: status.playing});

        this.timerID = setInterval(() => {
            let remainingTime = this.state.countDownTimer;
            remainingTime--;
            this.setState({countDownTimer: remainingTime});
            if (remainingTime == 0 && this.state.remainingBlocks != 0) {
                this.setState({status: status.failed});
                clearInterval(this.timerID);
                let result = confirm("You failed to solve it this time. Do you want to try again?");
                if (result == true) {
                    this.handleGameStart();
                } else {
                    this.setState({ status: status.initial });
                }
            }
        }, 1000);
    }

    handleBlocksMatched() {
        let remainingBlocks = this.state.remainingBlocks - 2;
        this.setState({remainingBlocks: remainingBlocks, score: this.state.score + 5});
        if (remainingBlocks == 0) {
            this.setState({status: status.finished});
            clearInterval(this.timerID);
            alert("Congratulations! You nailed it!");
        }
    }

    handleBlocksMismatched() {
        this.setState({ score: this.state.score - 2 });
    }

    render() {
        return (
            <div>
                <Caption remainingTime={this.state.countDownTimer} score={this.state.score} />
                <Board blockValues={this.state.blockValues} onBlocksMatched={this.handleBlocksMatched} onBlocksMismatched={this.handleBlocksMismatched} gameStatus={this.state.status} />
                <StartButton status={this.state.status} onStart={this.handleGameStart} />
            </div>
        );
    }
}

function generateRandomBlockValues() {
    let blockValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    blockValues = blockValues.concat(blockValues);
    blockValues = _.shuffle(blockValues);
    return blockValues;
}