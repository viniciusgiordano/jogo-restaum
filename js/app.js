var RestaUm = (function () {
  var pino = 0,
    pinoFileira = null,
    pinoAtivo,
    messageTimeout = null,
    map = [],
    boardContainer = document.getElementById('boardContainer')
  var Public = {
    /**
     * Inicializa o jogo
     */
    init: function () {
      var disabled = [1, 2, 6, 7, 8, 9, 13, 14, 36, 37, 41, 42, 43, 44, 48, 49],
        row = 1

      // Limpa o tabuleiro caso o jogo seja reiniciado
      boardContainer.innerHTML = ''

      // Constrói pinos dentro do tabuleiro
      for (var i = 1; i <= 49; i++) {
        var div = document.createElement('div')
        if (disabled.indexOf(i) >= 0) {
          div.className = 'posicao p-' + i + ' disabled'
        } else {
          // Constroi mapa de peças para ser utilizado para verificação de game over
          if (map[i] !== undefined) map.push(i)
          // Caso seja o pino central adiciona formatação de buraco, senão, formatação de pino normal
          if (i == 25) {
            div.className = 'posicao p-' + i + ' empty'
            div.setAttribute('data-hole', true)
            map[i] = {
              type: 'hole',
              row: row
            }
          } else {
            div.className = 'posicao p-' + i + ' active'
            map[i] = {
              type: 'pin',
              row: row
            }
          }
          div.addEventListener('click', Private.selectPin)
        }
        div.setAttribute('data-row', row)
        if (i % 7 == 0) {
          row++
        }
        div.setAttribute('data-index', i)
        boardContainer.appendChild(div)
      }
    },

    /**
     * Reinicia o jogo, resetando jogadas, pontuação e streak
     */
    restartGame: function () {
      Helper.removeClass(boardContainer, 'blocked')
      map = []
      pinoAtivo = null
      gameOver = true

      // Chama o 'construtor' novamente para remontar o tabuleiro
      Public.init()
    }
  }

  /**
   * Private funtions
   */
  var Private = {
    /**
     * Função para seleção de pino
     */
    selectPin: function () {
      var allowedTarget = this.getAttribute('data-hole') ? true : false

      // Caso o pino seja um buraco vazio (alvo permitido), realiza calculos e faz as verificações necessárias de acordo com os dados do pino selecionado
      if (allowedTarget) {
        if (pino > 0) {
          var allowMove = false,
            direction,
            deletePinoIndex,
            deletePino,
            indexTarget = parseInt(this.getAttribute('data-index')),
            pinoFileiraTarget = parseInt(this.getAttribute('data-row')),
            possibleTargets = [
              {
                position: parseInt(pino + 2),
                direction: 'r',
                row: pinoFileiraTarget
              },
              {
                position: parseInt(pino - 2),
                direction: 'l',
                row: pinoFileiraTarget
              },
              {
                position: parseInt(pino + 14),
                direction: 'd'
              },
              {
                position: parseInt(pino - 14),
                direction: 'u'
              }
            ]

          // Verifica se o movimento será possível
          for (var k in possibleTargets) {
            if (possibleTargets[k]['position'] == indexTarget) {
              direction = possibleTargets[k]['direction']
              // Se o movimento for esquerda ou direita, verifica se o pino e o alvo estão na mesma linha
              if (direction == 'l' || direction == 'r') {
                if (possibleTargets[k]['row'] != pinoFileira) {
                  allowMove = false
                } else {
                  allowMove = true
                }
              } else {
                allowMove = true
              }
            }
          }

          // Verifica direção do movimento
          switch (direction) {
            case 'l':
              deletePinoIndex = parseInt(pino - 1)
              break
            case 'r':
              deletePinoIndex = parseInt(pino + 1)
              break
            case 'd':
              deletePinoIndex = parseInt(pino + 7)
              break
            case 'u':
              deletePinoIndex = parseInt(pino - 7)
              break
          }
          deletePino = document.querySelector(
            '.p-' + deletePinoIndex + '.active'
          )

          // Caso seja um movimento permitido
          if (allowMove && deletePino) {
            // Passa o pino para o novo buraco
            this.removeAttribute('data-hole')
            Helper.removeClass(this, 'empty')
            Helper.addClass(this, 'active')

            // Remove o pino do buraco de origem
            pinoAtivo.setAttribute('data-hole', true)
            Helper.removeClass(pinoAtivo, 'active')
            Helper.addClass(pinoAtivo, 'empty')

            // Remove do tabuleiro o pino dentro do range
            deletePino = document.querySelector('.p-' + deletePinoIndex)
            deletePino.setAttribute('data-hole', true)
            Helper.removeClass(deletePino, 'active')
            Helper.addClass(deletePino, 'empty')

            // Atualiza mapa
            map[pino].type = 'hole'
            map[deletePinoIndex].type = 'hole'
            map[indexTarget].type = 'pin'

            // Reseta pino selecionado
            pino = 0
          } else {
            Private.showMessage('Você não pode realizar este movimento')
            return
          }
        } else {
          Private.showMessage('Não há nenhum pino selecionado')
          return
        }
      } else {
        // Caso a seleção não seja um buraco vazio, atribui os dados do pino selecionado nas variáveis
        var activeClass = this.className,
          allPinos = document.getElementsByClassName('active')

        // Índice do pino
        pino = parseInt(this.getAttribute('data-index'))
        pinoFileira = parseInt(this.getAttribute('data-row'))
        // Elemento do pino ativo no momento
        pinoAtivo = this

        // Atribui formatação especial ao pino selecionado (feedback visual)
        if (Helper.hasClass(this, 'selected')) {
          this.classList.remove('selected')
          pino = 0
        } else {
          for (var p = 0; p <= allPinos.length; p++) {
            Helper.removeClass(allPinos[p], 'selected')
          }
          Helper.addClass(this, 'selected')
        }
      }
    },

    /**
     * Dispara mensagem
     * @param {String} message - Texto da mensagem
     */
    showMessage: function (message) {
      var divMessage = document.getElementById('message')

      if (message) {
        divMessage.textContent = message
        Helper.addClass(divMessage, 'visible')

        if (messageTimeout) {
          clearTimeout(messageTimeout)
          messageTimeout = null
        }
        messageTimeout = setTimeout(function () {
          Helper.removeClass(divMessage, 'visible')
        }, 3000)
      } else {
        console.warn("Parâmetro 'message' inválido.")
      }
    }
  }

  return Public
})()
RestaUm.init()
