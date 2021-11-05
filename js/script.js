var formula = document.querySelector("#formula")
var btn_verificar = document.createElement("input")
var divResul = document.querySelector("#resul")
var divAnalise = document.querySelector("#analise")
var quadroArvS = document.querySelector("#quadroArvS")
var arvore = document.querySelector("#arvore")

divAnalise.style.display = "none"
quadroArvS.style.display = "none"

var subformulas = [],
    arvS = [],
    altArvS = 0

btn_verificar.setAttribute("type", "submit")
btn_verificar.setAttribute("id", "btnVerificar")
btn_verificar.setAttribute("value", "Verificar")

divResul.style.backgroundColor = "	#EEE8AA"
divResul.style.padding = "10px 3px 10px 5px"

document.querySelector("#formulario").append(btn_verificar)

function verificaSimboloAtomico(s) {
    if (s.length != 1) return false

    var n = s.charCodeAt(0)

    if (n >= 97 && n <= 122) return true
    else return false
}

function verificaBalanco(s) {
    var erro = abre = i = 0

    while (i < s.length) {
        if (s[i] == '(' && s[i + 1] == ')') {
            erro = 1
            break
        }
        if (s[i] == '(') abre++
        if (s[i++] == ')')
            if (abre > 0) abre--
            else {
                erro = 1
                break
            }
    }

    if (erro == 1 || abre > 0) return false

    return true
}

function conectorPrioritario(s) {
    var ordemPrioridade = []
    var i = s.length - 1

    while (i >= 0) {
        if (s[i] == "&" || s[i] == "#" || s[i] == ">")
            ordemPrioridade.push(i)
        i--
    }

    for (i = 0; i < ordemPrioridade.length; i++)
        if (verificaBalanco(s.slice(1, ordemPrioridade[i])) &&
            verificaBalanco(s.slice(ordemPrioridade[i] + 1, s.length - 1)))
            return ordemPrioridade[i]

    return ordemPrioridade[0]
}

function verificaFormula(s) {
    subformulas.push(s)
    if (verificaSimboloAtomico(s))
        return true

    if (s[0] == '−')
        return verificaFormula(s.slice(1, s.length))

    var conector = conectorPrioritario(s)

    if (conector != -1 && s[0] == '(' && s[s.length - 1] == ')')
        return verificaFormula(s.slice(1, conector)) && verificaFormula(s.slice(conector + 1, s.length - 1))

    return false
}

function calculaComplexidade(s) {
    const simbProp = ['−', '&', '#', '>']
    var cont = 0
    if (verificaFormula(s)) {
        for (i = 0; i < s.length; i++)
            if (simbProp.indexOf(s[i]) != -1 || verificaSimboloAtomico(s[i]))
                cont++
    } else return ""
    return cont
}

function arvSintatica(s, altArvS) {

    if (verificaSimboloAtomico(s))
        return arvS.push([s, altArvS])

    if (s[0] == '−') {
        arvS.push([s[0], altArvS])
        return arvSintatica(s.slice(1, s.length), altArvS + 1)
    }

    var conector = conectorPrioritario(s)

    if (conector != -1 && s[0] == '(' && s[s.length - 1] == ')') {
        arvS.push([s[conector], altArvS])
        arvSintatica(s.slice(1, conector), altArvS + 1)
        arvSintatica(s.slice(conector + 1, s.length - 1), altArvS + 1)
    }

    return arvS
}

btn_verificar.onclick = function () {
    if (verificaFormula(formula.value)) {
        divResul.style.backgroundColor = "#99ffa6"
        divAnalise.style.display = "block"
        quadroArvS.style.display = "block"
        document.querySelector("#resultado").innerHTML = "✔ É uma fórmula proposicional!"
        document.querySelector("#subformulas").innerHTML = ""
        document.querySelector("#arvore").innerHTML = ""

        subformulas = subformulas.filter(
            function (subformula, pos, self) {
                return self.indexOf(subformula) == pos
            }
        )

        for (i = 0; i < subformulas.length; i++) {
            document.querySelector("#subformulas").append("• " + subformulas[i])
            document.querySelector("#subformulas").append(document.createElement("br"))
        }
        document.querySelector("#complexidade").innerHTML = calculaComplexidade(formula.value)

        arvSintatica(formula.value, altArvS)

        var altura = 0
        for (i = 1; i < arvS.length; i++) {
            if (altura < (arvS[i])[1])
                altura = (arvS[i])[1]
        }

        var tabArv = ""
        const conector = ['&', '#', '>']
        for (i = 0; i <= altura; i++) {
            tabArv += "<table border='0' style='width:100%;text-align: center;font-size: 20px'>"
            for (let j = i; j < arvS.length; j++) {
                if ((arvS[j])[1] == i) {
                    tabArv += "<td style='position: relative;padding-bottom: 10px'>"
                    tabArv += ((arvS[j])[0])
                    if (conector.indexOf((arvS[j])[0]) != -1)
                        tabArv += "<span class='seta'>↙↘</span>"
                    else if ((arvS[j])[0] == "−")
                        tabArv += "<span class='seta'>↓</span>"
                    tabArv += "</td>"
                }
            }
            tabArv += "</tr></table>"
        }
        arvore.innerHTML = tabArv
        arvS = []
    } else {
        if (formula.value == "") {
            divResul.style.backgroundColor = "	#EEE8AA"
            document.querySelector("#resultado").innerHTML = "Insira uma fórmula."
        } else {
            divResul.style.backgroundColor = "#ffa8a8"
            document.querySelector("#resultado").innerHTML = "✘ Não é uma fórmula proposicional."
        }
        document.querySelector("#subformulas").innerHTML = ""
        document.querySelector("#complexidade").innerHTML = ""
        divAnalise.style.display = "none"
        quadroArvS.style.display = "none"
    }
    subformulas = []
}