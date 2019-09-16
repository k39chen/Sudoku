function Board(game) {
  this._game = game;
  this._el = document.getElementById('board');
  this._rows = 9;
  this._cols = 9;
  this._activeCell = '1_1';
  this._activeHighlight = null;
  this._cells = [];

  // this is what we use for managing do/undo
  this._stateIndex = 0;
  this._states = [];

  this.init = (puzzle, resetStates = true) => {
    let cell;
    let cellValue;
    let row;
    let col;
    let rowEl;
    let rowCells;

    // clear the baord first
    this._el.innerHTML = '';

    if (resetStates) {
      this._states = [];
      this._stateIndex = 0;
    }
    // go through each cell of the puzzle and generate
    // the elements accordingly
    for (row = 0; row < this._rows; row++) {
      rowEl = document.createElement('div');
      rowEl.classList = 'board-row';
      rowEl.setAttribute('data-index', row + 1);
      rowCells = [];

      for (col = 0; col < this._cols; col++) {
        cellValue = puzzle[row][col];
        cell = new Cell(row+ 1, col + 1, cellValue !== '.' ? cellValue : undefined);
        cell.getElement().addEventListener('click', (ev) => {
          this.setActiveCell(
            ev.target.getAttribute('data-row'),
            ev.target.getAttribute('data-col')
          );
        })
        rowEl.appendChild(cell.getElement());
        rowCells[col + 1] = cell;
      }
      this._cells[row + 1] = rowCells;
      this._el.appendChild(rowEl);
    }
    if (!resetStates) {
      this.setActiveCell();
    }
  };

  this.getState = () => {
    const values = [];
    let row;
    let col;
    let cell;
    let rowValues;
    for (row = 1; row <= this._rows; row++) {
      rowValues = [];
      for (col = 1; col <= this._cols; col++) {
        cell = this.getCell(row, col);

        if (cell.hasValue()) {
          rowValues.push(cell.getValue().toString());
        } else if (cell.hasAnnotations()) {
          rowValues.push(cell.getAnnotations());
        } else {
          rowValues.push('');
        }
      }
      values.push(rowValues);
    }
    return JSON.parse(JSON.stringify(values));
  };

  this.setState = (state) => {
    let row;
    let col;
    let cell;
    let cellState;

    for (row = 0; row < this._rows; row++) {
      for (col = 0; col < this._cols; col++) {
        cell = this.getCell(row + 1, col + 1);
        cellState = state[row][col];

        if (cell.isConstant()) continue;

        if (typeof cellState === 'object') {
          cell.bulkAnnotate(cellState, true);
        } else {
          cell.setValue(cellState, true);
        }
      }
    }
    this.setActiveCell();
    this.check();
  };

  this.getValues = () => {
    const values = [];
    let row;
    let col;
    let cell;
    let cellValue;
    for (row = 1; row <= this._rows; row++) {
      for (col = 1; col <= this._cols; col++) {
        cell = this.getCell(row, col);
        cellValue = cell.getValue();
        values.push(cellValue ? cellValue : '.');
      }
    }
    return values.join('');
  };

  this.setValues = (values, forceAnnotate = false) => {
    let row;
    let col;
    let cell;
    let cellValue;
    let i;

    for (row = 0; row < this._rows; row++) {
      for (col = 0; col < this._cols; col++) {
        cell = this.getCell(row + 1, col + 1);
        cellValue = values[row][col];

        if (cell.isConstant()) continue;
        if (cell.isUserInputted()) continue;

        if (cellValue.length > 1) {
          cell.bulkAnnotate(cellValue.split(''));
        } else {
          cellValue = parseInt(cellValue, 10);
          if (forceAnnotate) {
            cell.annotate(cellValue);
          } else {
            cell.setValue(cellValue);
            this.performRollback();
          }
        }
      }
    }
    this.check();
  };

  this.showErrors = (errors) => {
    let cell;
    let parts;
    let row;
    let col;
    for (let i = 0; i < errors.length; i++) {
      parts = errors[i].split('_');
      row = parseInt(parts[0], 10);
      col = parseInt(parts[1], 10);
      cell = this.getCell(row, col);
      cell.showError();
    }
  };

  this.getCell = (row, col) => {
    return this._cells[row][col];
  };

  this.performRollback = () => {
    const activeCellParts = this._activeCell.split('_');
    const activeRow = parseInt(activeCellParts[0], 10);
    const activeCol = parseInt(activeCellParts[1], 10)
    const activeRowBlock = Math.floor((activeRow - 1) / 3);
    const activeColBlock = Math.floor((activeCol - 1) / 3);
    const activeCell = this.getActiveCell();
    const activeCellValue = activeCell.getValue();
    let row;
    let col;
    let cell;
    let rowBlock;
    let colBlock;

    if (activeCell.hasValue()) {
      // remove all annotations with this cell's value in the current row and column
      for (row = 1; row <= this._rows; row++) {
        for (col = 1; col <= this._cols; col++) {
          cell = this.getCell(row, col);
          rowBlock = Math.floor((row - 1) / 3);
          colBlock = Math.floor((col - 1) / 3);
          
          if (
            row === activeRow ||
            col === activeCol ||
            (
              rowBlock === activeRowBlock &&
              colBlock === activeColBlock
            )
          ) {
            cell.removeAnnotation(activeCellValue);
          }
        }
      }
    }
  };

  this.getActiveCell = () => {
    const activeCellParts = this._activeCell.split('_');
    const activeRow = parseInt(activeCellParts[0], 10);
    const activeCol = parseInt(activeCellParts[1], 10)
    return this._cells[activeRow][activeCol];
  };

  this.setActiveCell = (activeRow, activeCol) => {
    let row;
    let col;
    let cell;

    if (!activeRow && !activeCol) {
      const activeCellParts = this._activeCell.split('_');
      activeRow = parseInt(activeCellParts[0], 10);
      activeCol = parseInt(activeCellParts[1], 10)
    } else {
      activeRow = Math.min(Math.max(activeRow, 1), 9);
      activeCol = Math.min(Math.max(activeCol, 1), 9);
    }
    this._activeCell = [activeRow, activeCol].join('_');

    for (row = 1; row <= this._rows; row++) {
      for (col = 1; col <= this._cols; col++) {
        cell = this.getCell(row, col);
        if (row === activeRow && col === activeCol) {
          cell.setActive();
        } else {
          cell.setInactive();
        }
      }
    }
  };

  this.highlightNumber = (value) => {
    let row;
    let col;
    let cell;
    let cellValue;

    this.removeHighlights();

    if (this._activeHighlight === value) {
      this._activeHighlight = null;
      return;
    }
    for (row = 1; row <= this._rows; row++) {
      for (col = 1; col <= this._cols; col++) {
        cell = this.getCell(row, col);
        cellValue = (cell.getValue() || '').toString();

        if (cellValue === value.toString() || cell.hasAnnotation(value)) {
          cell.highlight();
        }
      }
    }
    this._activeHighlight = value;
  };

  this.removeHighlights = () => {
    let row;
    let col;
    let cell;

    for (row = 1; row <= this._rows; row++) {
      for (col = 1; col <= this._cols; col++) {
        cell = this.getCell(row, col);
        cell.unhighlight();
      }
    }
  };

  this.do = (type, val) => {
    const cell = this.getActiveCell();
    if (cell.isConstant()) return;

    if (type === '~') {
      cell.annotate(val);
    } else if (type === '=') {
      cell.setValue(val, false, true);
      this.performRollback();
    }

    if (this._stateIndex !== this._states.length - 1) {
      this._states = this._states.splice(0, this._stateIndex + 1);
    }
    this._states.push(this.getState());
    this._stateIndex = this._states.length - 1;
    this.check();
  };

  this.undo = () => {
    this._stateIndex--;
    if (this._stateIndex < 0) {
      this.init(this._game.toMatrix(this._game._puzzle), false);
    } else {
      const state = this._states[this._stateIndex];
      this.setState(state);
    }
    this.check();
  };

  this.redo = () => {
    this._stateIndex = Math.max(Math.min(this._stateIndex + 1, this._states.length - 1), 0);
    const state = this._states[this._stateIndex];
    this.setState(state);
    this.check();
  };

  this.check = () => {
    this._game.isComplete();
  };

  window.addEventListener('keyup', (ev) => {
    const activeCellParts = this._activeCell.split('_');
    const activeRow = parseInt(activeCellParts[0], 10);
    const activeCol = parseInt(activeCellParts[1], 10);
    const isCapsLockOn = ev.getModifierState('CapsLock');

    switch(ev.keyCode) {
      case 37: // left
        if (!this._game._timer.isPaused()) {
          this.setActiveCell(activeRow, activeCol - 1);
        }
        break;
      case 39: // right
        if (!this._game._timer.isPaused()) {  
          this.setActiveCell(activeRow, activeCol + 1);
        }
        break;
      case 38: // up
        if (!this._game._timer.isPaused()) {  
          this.setActiveCell(activeRow - 1, activeCol);
        }
        break;
      case 40: // down
        if (!this._game._timer.isPaused()) {  
          this.setActiveCell(activeRow + 1, activeCol);
        }
        break;
      case 8: // backspace
        if (!this._game._timer.isPaused()) {
          this.do('=', '');
        }
        break;
      case 80: // P
        if (ev.ctrlKey) {  
          this._game.togglePause();
        }
        break;
      case 82: // R
        if (ev.ctrlKey) {
          this._game.reset();
        }
        break;
      case 86: // V
        if (ev.ctrlKey) {
          this._game.validate();
        }
        break;
      case 89: // Y
        if (ev.ctrlKey) {
          this.redo();
        }
        break;
      case 90: // Z
        if (ev.ctrlKey) {
          this.undo();
        }
        break;
      case 188: // ,
        if (ev.ctrlKey) {
          if (this._game._pane.isOpen()) {
            this._game._pane.close();
          } else {
            this._game._pane.open();
          }
        }
        break;
      case 190: // ,
        if (ev.ctrlKey) {
          if (this._game._help.isOpen()) {
            this._game._help.close();
          } else {
            this._game._help.open();
          }
        }
        break;
      case 49: // 1
        if (ev.ctrlKey) {
          this.highlightNumber(1);
        } else {
          if (isCapsLockOn) {
            if (ev.shiftKey) {
              this.do('=', 1);
            } else {
              this.do('~', 1);
            }
          } else {
            if (ev.shiftKey) {
              this.do('~', 1);
            } else {
              this.do('=', 1);
            }
          }
        }
        break;
      case 50: // 2
        if (ev.ctrlKey) {
          this.highlightNumber(2);
        } else {
          if (isCapsLockOn) {
            if (ev.shiftKey) {
              this.do('=', 2);
            } else {
              this.do('~', 2);
            }
          } else {
            if (ev.shiftKey) {
              this.do('~', 2);
            } else {
              this.do('=', 2);
            }
          }
        }
        break;
      case 51: // 3
        if (ev.ctrlKey) {
          this.highlightNumber(3);
        } else {
          if (isCapsLockOn) {
            if (ev.shiftKey) {
              this.do('=', 3);
            } else {
              this.do('~', 3);
            }
          } else {
            if (ev.shiftKey) {
              this.do('~', 3);
            } else {
              this.do('=', 3);
            }
          }
        }
        break;
      case 52: // 4
        if (ev.ctrlKey) {
          this.highlightNumber(4);
        } else {
          if (isCapsLockOn) {
            if (ev.shiftKey) {
              this.do('=', 4);
            } else {
              this.do('~', 4);
            }
          } else {
            if (ev.shiftKey) {
              this.do('~', 4);
            } else {
              this.do('=', 4);
            }
          }
        }
        break;
      case 53: // 5
        if (ev.ctrlKey) {
          this.highlightNumber(5);
        } else {
          if (isCapsLockOn) {
            if (ev.shiftKey) {
              this.do('=', 5);
            } else {
              this.do('~', 5);
            }
          } else {
            if (ev.shiftKey) {
              this.do('~', 5);
            } else {
              this.do('=', 5);
            }
          }
        }
        break;
      case 54: // 6
        if (ev.ctrlKey) {
          this.highlightNumber(6);
        } else {
          if (isCapsLockOn) {
            if (ev.shiftKey) {
              this.do('=', 6);
            } else {
              this.do('~', 6);
            }
          } else {
            if (ev.shiftKey) {
              this.do('~', 6);
            } else {
              this.do('=', 6);
            }
          }
        }
        break;
      case 55: // 7
        if (ev.ctrlKey) {
          this.highlightNumber(7);
        } else {
          if (isCapsLockOn) {
            if (ev.shiftKey) {
              this.do('=', 7);
            } else {
              this.do('~', 7);
            }
          } else {
            if (ev.shiftKey) {
              this.do('~', 7);
            } else {
              this.do('=', 7);
            }
          }
        }
        break;
      case 56: // 8
        if (ev.ctrlKey) {
          this.highlightNumber(8);
        } else {
          if (isCapsLockOn) {
            if (ev.shiftKey) {
              this.do('=', 8);
            } else {
              this.do('~', 8);
            }
          } else {
            if (ev.shiftKey) {
              this.do('~', 8);
            } else {
              this.do('=', 8);
            }
          }
        }
        break;
      case 57: // 9
        if (ev.ctrlKey) {
          this.highlightNumber(9);
        } else {
          if (isCapsLockOn) {
            if (ev.shiftKey) {
              this.do('=', 9);
            } else {
              this.do('~', 9);
            }
          } else {
            if (ev.shiftKey) {
              this.do('~', 9);
            } else {
              this.do('=', 9);
            }
          }
        }
        break;
      default:
        break;
    }
  });
}
