'use strict'

var gBoard
const MINE = '💣'
const MARK = '🚩'
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
  resetGame()
  buildBoard()
  addSmileyBtn()
  renderBoard()
  updateDashboard()
}

function resetGame() {
  gGame.isOn = false
  gGame.revealedCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.livesLeft = 3
}

function onFirstClick(rowIdx, colIdx) {
  gGame.isOn = true
  gBoard[rowIdx][colIdx].firstClicked = true
  setMines()
  setMinesNegsCount()
  renderBoard()
  const elCell = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
  // elCell.querySelector('span').classList.remove('covered')
  // console.log('FROM onFirstClick:',elCell,elCell.innerHTML)
  return elCell
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
  if (gBoard[0][0].firstClicked) console.log(getRandCell())
  gBoard[1][1].isMine = true
  gBoard[2][3].isMine = true

  /////////ACTUAL FUNCTION:
  // for (var i = 0; i < gLevel.MINES; i++) {
  //   const cell = getRandCell()
  //   gBoard[cell.i][cell.j].isMine = true
  // }
}


function renderBoard() { //DOM
  var strHTML = ''

  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>'

    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      const cellContent = currCell.isMine ? MINE : currCell.minesAroundCount
      const className = `cell cell-${i}-${j}`

      strHTML += `<td onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this)" class="${className}"><span class="covered">${cellContent}</span></td>`
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
  const cell = getCurrCell(elCell) //cell={minesAroundCount: 0, isCovered: true, isMine: false, isMarked: false} OBJECT
  if (gGame.revealedCount === 0) elCell = onFirstClick(rowIdx, colIdx)
  if (!cell.isCovered || !gGame.isOn || cell.isMarked) return
  // console.log(elCell)

  //MODEL
  cell.isCovered = false
  if (!cell.isMine) gGame.revealedCount++
  checkGameOver()
  //DOM
  const elSpan = elCell.querySelector(`.covered`) //Can also use span instead of .covered
  elSpan.classList.remove('covered')
  if (+elSpan.innerHTML === 0) expandReveal(elCell, rowIdx, colIdx)  /////WILL NEED TO BE CHANGED WHEN WE STOP USING 0 AND MOVE TO BLANK
  if (cell.isMine) handleMineClicks(elCell)
  console.log(gGame)
}

function onCellMarked(elCell) {
  event.preventDefault()
  const cell = getCurrCell(elCell)
  if (!gGame.isOn || (!cell.isCovered && !cell.isMine)) return

  if (!cell.isMarked) {
    if (cell.isMine && !cell.isCovered) coverCell(elCell)
    cell.isMarked = true
    gGame.markedCount++
    elCell.innerHTML += `<span class="marked">${MARK}</span>`
    checkGameOver()
  } else {
    cell.isMarked = false
    gGame.markedCount--
    elCell.innerHTML = elCell.innerHTML.replace(`<span class="marked">${MARK}</span>`, '')
  }
}

function handleMineClicks(elCell) {
  if (gGame.livesLeft > 0) {
    gGame.livesLeft--
    // const elLives = document.querySelector('.lives-counter span')
    // elLives.innerText = `${gGame.livesLeft}`
    updateDashboard()

    setTimeout(coverCell, 1500, elCell)
  } else checkGameOver()
}

function coverCell(elCell) {
  const cell = getCurrCell(elCell)
  if (cell.isCovered) return
  //MODEL
  // console.log(elCell)
  cell.isCovered = true
  //DOM
  // console.log(elCell.classList[1].split('-'))
  elCell.querySelector('span').classList.add('covered')
}

function expandReveal(elCell, i, j) {
  //CHECK FOR CURRENT VALUE - NOT 0? RETURN!
  countMineNegs(i, j, true)
}

function checkGameOver() {
  if (!gGame.isOn) return ////To handle the multi console logs, DELETE IN THE END ONCE THERE'S MODAL
  if ((gGame.revealedCount + gGame.markedCount == gLevel.SIZE ** 2 && gGame.markedCount === gLevel.MINES) ||
    gGame.livesLeft === 0) {
    gGame.isOn = false
    console.log('GAME OVER')
  }
}

function setMinesNegsCount() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      const minesNegsCount = countMineNegs(i, j, false)
      currCell.minesAroundCount = minesNegsCount
    }
  }
}

function addSmileyBtn() {
  const elH3Smiley = document.querySelector('.smiley-btn')
  elH3Smiley.innerText = '😃'
}

