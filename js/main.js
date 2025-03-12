'use strict'

var gBoard
const MINE = '💣'
// var gLevel.SIZE = 4
const gLevel = {
  SIZE: 4,
  MINES: 2
}

const gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0
}


function onInit() {
  buildBoard()
  setMines()
  setMinesNegsCount() //Might need to be moved in the bonus where the first click always opens a non-mine cell
  renderBoard()
}

function buildBoard() { //Model
  gBoard = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    var row = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      var cell = {
        minesAroundCount: 0,
        isCovered: true,
        isMine: false,
        isMarked: false
      }
      row.push(cell)
    }
    gBoard.push(row)
  }
  console.table(gBoard)
}

function setMines() {
  //For Tests
  gBoard[1][1].isMine = true
  gBoard[2][3].isMine = true

///////////ACTUAL FUNCTION:
  // for (var i = 0; i < gLevel.MINES; i++) {
  //   const cell = getRandCell()
  //   gBoard[cell.i][cell.j].isMine = true
  // }
}

function getRandCell() {
  var isValid = false
  const randPos = {}
  while (!isValid) {
    randPos.i = getRandomInt(0, gLevel.SIZE),
    randPos.j = getRandomInt(0, gLevel.SIZE)
    if (!gBoard[randPos.i][randPos.j].isMine) return randPos
  }
  return null
}

function renderBoard() { //DOM
  var strHTML = ''

  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>'

    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      const cellContent = currCell.isMine ? MINE : currCell.minesAroundCount
      const className = `cell cell-${i}-${j}`

      strHTML += `<td onclick="onCellClicked(this,${i},${j})" class="${className}"><span class="closed">${cellContent}</span></td>`
    }
    strHTML += '</tr>'
  }
  const elContainer = document.querySelector('.board')
  elContainer.innerHTML = strHTML
}

function onCellClicked(elCell, rowIdx, colIdx) {
  if(!gBoard[rowIdx][colIdx].isCovered) return
  //MODEL
  gBoard[rowIdx][colIdx].isCovered = false
  gGame.revealedCount++
  //DOM
  const elSpan = elCell.querySelector(`.closed`) //Can also use span instead of .closed
  elSpan.classList.remove('closed')
}

function setMinesNegsCount() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      const minesNegsCount = countMineNegs(i, j)
      // console.log('i:',i,'j:',j,'mineNegsCount:',minesNegsCount)
      currCell.minesAroundCount = minesNegsCount
    }
  }
}

function countMineNegs(rowIdx, colIdx) { //0,3
  var mineNegsCount = 0
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue
    for (var j = colIdx - 1; j <= colIdx + 1; j++) { //0,2 con <=0,4
      if (j < 0 || j > gBoard[i].length - 1) continue
      if (i === rowIdx && j === colIdx) continue
      const currCell = gBoard[i][j]
      // debugger
      if (currCell.isMine) {
        mineNegsCount++
      }
    }
  }
  return mineNegsCount
}
