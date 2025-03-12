'use strict'

var gBoard
const MINE = '💣'
const gLevel = {
  SIZE: 4,
  MINES: 2
}

const gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
  livesLeft: 3
}


function onInit() {
  buildBoard()
  // setMines()
  // setMinesNegsCount() //Might need to be moved in the bonus where the first click always opens a non-mine cell
  renderBoard()
  updateDashboard()
}

function onFirstClick(rowIdx, colIdx) {
  gGame.isOn = true
  gBoard[rowIdx][colIdx].firstClicked = true
  setMines()
  setMinesNegsCount()
  renderBoard()
  const elFirstClickedCell = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
  elFirstClickedCell.querySelector('span').classList.remove('covered')
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
  // if(gBoard[0][0].firstClicked) console.log(getRandCell())
  // gBoard[1][1].isMine = true
  // gBoard[2][3].isMine = true

  /////////ACTUAL FUNCTION:
  for (var i = 0; i < gLevel.MINES; i++) {
    const cell = getRandCell()
    gBoard[cell.i][cell.j].isMine = true
  }
}


function renderBoard() { //DOM
  var strHTML = ''

  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>'

    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      const cellContent = currCell.isMine ? MINE : currCell.minesAroundCount
      const className = `cell cell-${i}-${j}`

      strHTML += `<td onclick="onCellClicked(this,${i},${j})" class="${className}"><span class="covered">${cellContent}</span></td>`
    }
    strHTML += '</tr>'
  }
  const elContainer = document.querySelector('.board')
  elContainer.innerHTML = strHTML
}

function updateDashboard() {
  const livesCount = document.querySelector('.lives-counter span')
  livesCount.innerHTML = gGame.livesLeft
}

function onCellClicked(elCell, rowIdx, colIdx) {
  
  if (gGame.revealedCount === 0) onFirstClick(rowIdx, colIdx)
  if (!gBoard[rowIdx][colIdx].isCovered) return
  // console.log(elCell)

  //MODEL
  gBoard[rowIdx][colIdx].isCovered = false
  gGame.revealedCount++
  //DOM
  const elSpan = elCell.querySelector(`.covered`) //Can also use span instead of .covered
  elSpan.classList.remove('covered')

if (gBoard[rowIdx][colIdx].isMine) handleMineClicks(elCell)
}

function handleMineClicks(elCell) {
  if (gGame.livesLeft > 0) {
    gGame.livesLeft--
    // const elLives = document.querySelector('.lives-counter span')
    // elLives.innerText = `${gGame.livesLeft}`
    updateDashboard()

    setTimeout(coverCell,1500,elCell)
  }
}

function coverCell(elCell) {
  //MODEL
  console.log(elCell)
  const currCell = getCellLocation(elCell)
  gBoard[currCell.i][currCell.j].isCovered = true
  gGame.revealedCount--
  //DOM
  console.log(elCell.classList[1].split('-'))
  elCell.querySelector('span').classList.add('covered')
}


function checkGameOver() {
  if (gGame.revealedCount + gGame.markedCount == gLevel.SIZE ** 2) {
    gGame.isOn = false
    console.log('GAME OVER')
  }
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
