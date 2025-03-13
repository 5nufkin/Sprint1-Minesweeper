'use strict'

var gBoard
var gInterval
var gFirstClick = false
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
  changeSmileyButton('😃')
  createHints()
  updateDashboard()
  renderBoard()
}

function resetGame() {
  clearInterval(gInterval)
  gGame.isOn = false
  gGame.revealedCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.livesLeft = 3
  gGame.secsPassed = 0
  gFirstClick = false
  renderTime()
}

function onFirstClick(rowIdx, colIdx) {
  gFirstClick = true
  gGame.isOn = true
  gBoard[rowIdx][colIdx].firstClicked = true
  setMines()
  setMinesNegsCount()
  renderBoard()
  gInterval = setInterval(runTimer, 1000)
  const elCell = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
  // elCell.querySelector('span').classList.remove('covered')
  // console.log('FROM onFirstClick:',elCell,elCell.innerHTML)
  return elCell
}

function runTimer() {
  gGame.secsPassed++
  renderTime()
}

function renderTime() {
  const elTimer = document.querySelector('.time span')
  elTimer.innerText = gGame.secsPassed
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
}

function setMines() {
  // //For Tests
  // if (gBoard[0][0].firstClicked) console.log(getRandCell())
  // gBoard[1][1].isMine = true
  // gBoard[2][3].isMine = true

  ///////ACTUAL FUNCTION:
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

      strHTML += `<td onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this, event)" class="${className}"><span class="covered">${cellContent}</span></td>`
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
  if (!gGame.isOn && !gFirstClick) elCell = onFirstClick(rowIdx, colIdx)
  if (!cell.isCovered || !gGame.isOn || cell.isMarked) return
  if (gGame.isHintMode) {
    useHint(elCell)
    return
  }

  //Model+DOM
  revealCell(elCell)

  if (cell.minesAroundCount === 0 && !cell.isMine) {
    expandReveal(gBoard, elCell, rowIdx, colIdx)
  }

  checkGameOver(cell)

  if (cell.isMine) handleLivesLeft()
}

/////////////////CHANGING BEGAN//////////////////////////

function onCellMarked(elCell, event) {

  event.preventDefault()
  const cell = getCurrCell(elCell)

  if (!gGame.isOn || (!cell.isCovered && !cell.isMine)) return
  if (cell.isMarked) {
    unMarkCell(elCell)
    return
  }

  markCell(elCell)
  checkGameOver(cell)

}

function revealCell(elCell) {

  const currCell = getCurrCell(elCell)
  if ((currCell.isMine && gGame.livesLeft > 0) || gGame.isHintMode) {
    elCell.querySelector('.covered').classList.remove('covered')
    setTimeout(unRevealCell, 1500, elCell)
  } else {
    //Update Model
    currCell.isCovered = false
    gGame.revealedCount++

    //Update Dom
    elCell.querySelector('.covered').classList.remove('covered')
  }

}

function unRevealCell(elCell) {
  elCell.querySelector('span').classList.add('covered')
}

function hideCell(elCell) {
  const currCell = getCurrCell(elCell)
  console.log(gGame.isHintMode)

  if (currCell.isMine || gGame.isHintMode) { //Cover Without changing the Model and revealedCount
    elCell.querySelector('span').classList.add('covered')

  } else {

    currCell.isCovered = true
    gGame.revealedCount--
    elCell.querySelector('span').classList.add('covered')
  }
}

function markCell(elCell) {
  const cell = getCurrCell(elCell)
  cell.isMarked = true
  gGame.markedCount++
  addMark(elCell)
  // if(cell.isMine&&!cell.isCovered) hideCell(elCell)
}

function addMark(elCell) {
  elCell.innerHTML += `<span class="marked">${MARK}</span>`
}

function unMarkCell(elCell) {
  const cell = getCurrCell(elCell)
  cell.isMarked = false
  gGame.markedCount--
  removeMark(elCell)
}

function removeMark(elCell) {
  elCell.innerHTML = elCell.innerHTML.replace(`<span class="marked">${MARK}</span>`, '')
}

function handleLivesLeft() {
  if (gGame.livesLeft > 0) {
    gGame.livesLeft--
    updateDashboard()
  } else checkGameOver()
}

function checkGameOver(cell) {
  if (!gGame.isOn) return ////To handle the multi console logs, DELETE IN THE END ONCE THERE'S MODAL

  if ((gGame.revealedCount + gGame.markedCount === gLevel.SIZE ** 2 && gGame.markedCount === gLevel.MINES) ||
    gGame.livesLeft === 0 && cell.isMine && !cell.isMarked) {
    clearInterval(gInterval)
    var smiley

    if (isWin(cell)) {
      smiley = '😎'
      handleBestTime()
    } else {
      smiley = '🤯'
    }

    changeSmileyButton(smiley)
    gGame.isOn = false
    console.log('GAME OVER')
  }
}

function isWin(cell) {
  if (gGame.revealedCount + gGame.markedCount === gLevel.SIZE ** 2 && gGame.markedCount === gLevel.MINES) return true
  if (cell.isMine && gGame.livesLeft === 0) return false
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

function changeSmileyButton(smiley) {
  const elH3Smiley = document.querySelector('.smiley')
  elH3Smiley.innerText = smiley
}

function createHints(hintCount = 3) {
  gGame.hintsLeft = hintCount
  gGame.isHintMode = false
  gGame.currHint = null
  const elHints = document.querySelector('.hints')
  var strHTML = ''

  for (var i = 0; i < hintCount; i++) {
    strHTML += `<button class="btn hint unused" onclick="activateHintMode(this)">💡</button>`
  }
  elHints.innerHTML = strHTML
}

function activateHintMode(elHintBtn) {
  gGame.elCurrHint = elHintBtn
  elHintBtn.classList.toggle('active')
  gGame.isHintMode = !gGame.isHintMode
}

function useHint(elCell) {
  const cell = getCellLocation(elCell)
  hintShowNegs(cell.i, cell.j)

  gGame.isHintMode = false //Model
  //DOM - remove the bulb
  gGame.elCurrHint.classList.add('used')
}

function onChangeLevel(size, mineCount) {
  gLevel.SIZE = size
  gLevel.MINES = mineCount
  onInit()
}

function handleBestTime() {
  var currBest = +getBestTime()
  if(!currBest)localStorage.setItem('bestTime')




  if (localStorage.getItem('bestTime')) {
    var currBest = localStorage.getItem('bestTime')
    console.log(currBest)
    console.log(+currBest)

  } else {
    localStorage.setItem('bestTime', gGame.secsPassed + '')
    currBest = localStorage.getItem('bestTime')
    console.log(currBest)
    console.log(+currBest)
  }
}

function getBestTime(level) {
  const currBest = localStorage.getItem('bestTime')

  switch (level) {
    case 'easy':
      
  }



  if(currBest) return currBest
  return null
}