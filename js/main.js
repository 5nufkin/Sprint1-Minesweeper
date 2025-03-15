'use strict'

var gBoard
var gInterval
var gTimeout
var gIsDark = true
var gFirstClick = false
var gDisableClicks = false
var gManualMode = false
var gIsManual = false
var gMinesToPos
var gMegaHint = {
  isMegaMode: false,
  clickCount: 0,
}
var gIsExtermination = false


const gLastMoves = []
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
  livesLeft: 3,
  safeClicksLeft: 3
}

function onInit() {
  resetGame()
  buildBoard()
  changeSmileyButton('😃')
  createHints()
  updateLivesLeft()
  renderBoard()
  renderBestTime()
}

function resetGame() {
  clearInterval(gInterval)
  gGame.isOn = false
  gGame.revealedCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.livesLeft = 3
  gGame.secsPassed = 0
  gGame.safeClicksLeft = 3
  gFirstClick = false
  gManualMode = false
  gIsManual = false
  gMinesToPos = null
  gMegaHint = {
    isMegaMode: false,
    clickCount: 0,
  }
  const elManualBtn = document.querySelector('.manually-create-btn')
  elManualBtn.innerText = `Manually Create`
  renderTime()
  const elOffBtns = document.querySelectorAll('.extras .off')
  for (var i = 0; i < elOffBtns.length; i++) {
    elOffBtns[i].classList.remove('off')
  }
    const elExtBtn = document.querySelector('.exterminator')
    elExtBtn.classList.add('off')
}

function onFirstClick(rowIdx, colIdx) {
  gFirstClick = true
  gGame.isOn = true
  gBoard[rowIdx][colIdx].firstClicked = true
  if (!gIsManual) {
    setMines()
    document.querySelector('.manually-create-btn').classList.add('off')
  }
  setMinesNegsCount()
  renderBoard()
  gInterval = setInterval(runTimer, 1000)
  const elCell = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
  if (gLevel.MINES > 3) {
    var elExtBtn = document.querySelector('.exterminator')
    elExtBtn.classList.remove('off')
  }
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

  // for (var i = 0, j = 0; i < 5; i++, j++){
  //   // debugger
  //   gBoard[i][j].isMine = true
  // }
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
      var cellContent = currCell.isMine ? MINE : currCell.minesAroundCount
      if (cellContent === 0) cellContent = ''
      var className = `cell cell-${i}-${j}`
      className += currCell.isCovered ? '' : ' revealed'
      const spanClassName = currCell.isCovered ? 'covered' : ''

      strHTML += `<td onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this, event)" class="${className}"><span class="${spanClassName}">${cellContent}</span></td>`
    }
    strHTML += '</tr>'
  }
  const elContainer = document.querySelector('.board')
  elContainer.innerHTML = strHTML
}

function updateLivesLeft() {
  const livesCount = document.querySelector('.lives-counter span')
  livesCount.innerHTML = gGame.livesLeft
}

function onCellClicked(elCell, rowIdx, colIdx) {
  if (gManualMode) {
    handleManualMode(elCell, rowIdx, colIdx)
    return
  }
  const cell = getCurrCell(elCell)
  if (gDisableClicks) return
  if (!gGame.isOn && !gFirstClick) elCell = onFirstClick(rowIdx, colIdx)
  if (gMegaHint.isMegaMode) {
    gMegaHint.clickCount++
    if (gMegaHint.clickCount === 1) gMegaHint.fromCell = { i: rowIdx, j: colIdx }
    if (gMegaHint.clickCount === 2) {
      gMegaHint.toCell = { i: rowIdx, j: colIdx }
      showMegaHint()
      gMegaHint.isMegaMode = false
    }
    return
  }
  if (!cell.isCovered || !gGame.isOn || cell.isMarked) return
  if (gGame.isHintMode) {
    useHint(elCell)
    gDisableClicks = true
    setTimeout(() => {
      gDisableClicks = false
    }, 1500);
    return
  }

  //Model+DOM
  revealCell(elCell)

  if (cell.minesAroundCount === 0 && !cell.isMine) {
    expandReveal(gBoard, elCell, rowIdx, colIdx)
  }
  // collapseReveal(gBoard, elCell, rowIdx, colIdx)

  checkGameOver(cell)

  if (cell.isMine) handleLivesLeft()
  // saveMove(cell, rowIdx, colIdx)
  // console.log('gLastMoves:', gLastMoves);
  // console.log('gLastMoves[0]:', gLastMoves[0]);
  if ((1 > (gLevel.SIZE ** 2 - gGame.revealedCount) - gLevel.MINES) && gFirstClick) {
    greyOutElement(document.querySelector('.manually-create-btn'))
  }
}

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
  // saveMove(cell)
}

// function undoMove() {
//   //Model
//   const lastMove = gLastMoves[gLastMoves.length - 1]
//   gGame.isOn = lastMove.mIsOn
//   gGame.livesLeft = lastMove.mLives
//   gGame.revealedCount = lastMove.mRevealed
//   gGame.markedCount = lastMove.mMarked

//   //DOM
//   // debugger
//   const elCell = getElementByPos(lastMove.mCellRowIdx, lastMove.mCellColIdx)
//   if (!lastMove.mIsCoveredCell) {
//     // if(lastMove.mMinesAround===0) collapseReveal(gBoard,elCell,lastMove.mCellRowIdx,lastMove.mCellColIdx)
//     unRevealCell(elCell)
//     gBoard[lastMove.mCellRowIdx][lastMove.mCellColIdx].isCovered = true
//   }
//   // else if (!lastMove)
// }


function revealCell(elCell, timer = 1500) {
  const currCell = getCurrCell(elCell)
  if ((currCell.isMine && gGame.livesLeft > 0) || gGame.isHintMode || gMegaHint.isMegaMode) {
    elCell.classList.add('revealed')
    elCell.querySelector('.covered').classList.remove('covered')
    gTimeout = setTimeout(unRevealCell, timer, elCell)
  } else {
    //Update Model
    currCell.isCovered = false
    gGame.revealedCount++

    //Update Dom
    elCell.classList.add('revealed')
    elCell.querySelector('.covered').classList.remove('covered')
  }

}

function unRevealCell(elCell) {
  elCell.querySelector('span').classList.add('covered')
  elCell.classList.remove('revealed')
}

function markCell(elCell) {
  unRevealCell(elCell)
  const cell = getCurrCell(elCell)
  cell.isMarked = true
  gGame.markedCount++
  addMark(elCell)
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
    updateLivesLeft()
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
      clearTimeout (gTimeout)
      const cells = document.querySelectorAll('.covered')
      for (var i = 0; i < cells.length; i++){
        cells[i].classList.remove('covered')
      }
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
  const level = getLevelName()
  const currLevelBest = +getBestTime(level)
  //Model
  if (gGame.secsPassed < currLevelBest || !currLevelBest) setBestTime(level, gGame.secsPassed)

  //DOM
  renderBestTime()
}

function renderBestTime() {
  const level = getLevelName()
  const currLevelBest = +getBestTime(level)
  var str = ''
  if (!currLevelBest) {
    str = '--'
  } else {
    str = `${currLevelBest}`
  }
  const elBestTime = document.querySelector('.best-time span')
  elBestTime.innerText = str
}

function onSafeClick() {
  if (!gGame.safeClicksLeft) return
  // if ((1 > (gLevel.SIZE ** 2 - gGame.revealedCount) - gLevel.MINES) && gFirstClick){
  //   greyOutElement(document.querySelector('.safe-click'))
  // }
  //Model
  const safeCell = getRandCell()
  const elSafeCell = getElementByPos(safeCell.i, safeCell.j)
  gGame.safeClicksLeft--

  //DOM
  elSafeCell.classList.add('safe-cell')
  setTimeout(() => {
    elSafeCell.classList.remove('safe-cell')
    if (gGame.safeClicksLeft === 0) {
      const elSafeButton = document.querySelector('.safe-click')
      // elSafeButton.classList.add('off')
      greyOutElement(elSafeButton)
    }
  }, 1500);
}

function onLightMode(elBtn) {
  gIsDark = !gIsDark
  const elBody = document.querySelector('body')
  elBody.classList.toggle('light-mode')
  elBtn.innerText = gIsDark ? 'Light Mode' : 'Dark Mode'
}

function onManuallyCreate() {
  //Model
  if (gGame.isOn) return
  buildBoard()
  gManualMode = true
  gMinesToPos = gLevel.MINES


  //DOM
  const elManualBtn = document.querySelector('.manually-create-btn')
  elManualBtn.innerText = `Mines left: ${gMinesToPos}`
}

function handleManualMode(elCell, rowIdx, colIdx) {
  //Model
  gBoard[rowIdx][colIdx].isMine = true
  gMinesToPos--

  //DOM
  //Change the buttons text to the number of mines to be positioned
  //Show mines until all were positioned

  elCell.classList.add('mineset')
  const elManualBtn = document.querySelector('.manually-create-btn')
  elManualBtn.innerText = `Mines left: ${gMinesToPos}`
  if (gMinesToPos === 0) {
    elManualBtn.classList.add('off')
    gManualMode = false
    gIsManual = true
    renderBoard()
  }
}

function onMegaHint(elMegaBtn) {
  //Model
  if (gMegaHint.disableClicks) return
  gMegaHint.isMegaMode = true
  gMegaHint.disableClicks = true

  //DOM
  greyOutElement(elMegaBtn)
}

function onExterminator() {
  //Model
  //Adjust winning condition!!!
  if (!gGame.isOn || gLevel.MINES <= 3) return
  gIsExtermination = true
  gLevel.MINES -= 3
  // debugger
  for (var i = 0; i < 3; i++) {
    const mine = getRandMine()
    gBoard[mine.i][mine.j].isMine = false
  }
  setMinesNegsCount()


  //DOM
  renderBoard()
  greyOutElement(document.querySelector('.exterminator'))
}

//ADD TITLES FOR SPECIAL BTNS