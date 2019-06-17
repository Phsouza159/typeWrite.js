(function(typeWrite){

    const dataName        = '[data-write]'; 
    const classGetElementBar = 'type-write-getBar';
    const classGetElementText = 'type-write-getElement'
    const styleBar        = '';

    const timeEntreTexto = 2000;

    let api = () => {
        let elements = [...document.querySelectorAll(dataName)];
        
        elements.forEach(e => {
            let val = e.dataset.write;

            init(val , e);
        })
    }

    /**
     * Criar elementos base
     * @returns {Object} retornar dois conjuntos eBar : barrar '|' e eText : elemento a ser inserido o texto
     */
    let prepara = () => {
        let span  = document.createElement('span');
        let bar   = document.createElement('span');

        bar.innerText = '|';
        bar.setAttribute('style' , styleBar );

        bar.setAttribute('class' , classGetElementBar );
        span.setAttribute('class' , classGetElementText);

        return { eBar : bar , eText : span};
    }

    /**
     * recuperar um array pelo o nome da sua assinatura
     * @param {string} nameArray
     * @returns {Array} 
     */
    let getArray = ( nameArray ) => {
        let arr = window[nameArray];
        
        return validarArray(arr , nameArray);
    }

    /**
     * validar array
     * @param {any} arr 
     * @param {sstring} name nome da assinatura do array
     */
    let validarArray = (arr , name ) => {
        if(arr == undefined)
            throw `não foi possível encontrar ${name}, dentro do escopo do window... verifique a declaração se está com 'var'.`;

        if(!Array.isArray(arr))
            throw `Espero um elemento do tipo array...`;

        return arr;
    }

    /**
     * Escrever texto no elemento
     * @param {string} arrayName nome do array javascript com texto a escrever 
     * @param {HTMLElement} element elemento para o evento 'write'
     */
    let init = async ( arrayName , element ) => {
        let argsBar = {};

        argsBar.barColor = element.dataset.barcolor != null ? element.dataset.barcolor : 'black';
        argsBar.barText  = element.dataset.bartext  != null ? element.dataset.bartext  : '|';  

        let main = new Promise((resolve , reject) => {
            try{
                let args = {};
                args.element = element;
                args.bol = 0;
                args.eBase = prepara();
                args.eBase.eBar.innerText = argsBar.barText;
                args.arr = getArray(arrayName);

                resolve(args);
            }catch(e){

                reject(e);
            }
        }) ;

        return execultarPromisse( main , argsBar);
    }

    /**
     * Execultar promise
     * @param {Promise} main promise 
     * @param {Object} argsBar objeto de configuracao
     */
    let execultarPromisse = async ( main , argsBar) => {
        main
        .then((args) => {
            let text = args.element.innerText; 
            if( text != null && text != '' )
                args.bol = 1;
            
            return args;
        })
        .then((args) => {
            args.element.appendChild(args.eBase.eText);
            args.element.appendChild(args.eBase.eBar);

            efeitoBarPiscar( argsBar , args.element.children[1]);

            return args;
        })
        .then((args) => {
            let callBack = () => {
                let prim = args.element.children[0];

                escreverConformeArray(args.arr , prim , 0);
            }

            if(args.bol) {

                setTimeout(()=> {
                    apagarTexto(args.element , callBack );
                } , timeEntreTexto)
            } else { 
                setTimeout(()=> {
                    callBack();
                } , timeEntreTexto)
            }
            return args;
        })
        .catch((err) => {
            console.error(err); 
        });

        return await Promise.resolve(main);
    }

    /**
     * Escrever texto do array no elemento com efeito de digitacao
     * @param {Array} arr array de string
     * @param {HTMLElement} element elemento a ser inserido
     * @param {number} possicao possicao do array de execulcao
     */
    let escreverConformeArray = async ( arr , element , possicao) => {

        if(possicao >= arr.length)
            return;

        let callBack = () => {
            if(possicao == arr.length - 1){
                escreverConformeArray(arr , element , possicao + 1);
            }
            else {
                apagarTexto(element , () => {
                    escreverConformeArray(arr , element , possicao + 1);
                })
            }
        }

        let text = arr[possicao];
        escrever( text , element , callBack);
    }
    /**
     * 
     * @param {string} text 
     * @param {HTMLElement} element 
     * @param {function} callBack 
     */
    let escrever = (text , element , callBack) => {
        if(typeof text != 'string' )
            throw 'Esperado um tipo string...';

        return delayEscrever( element , text , 0 , 100 , callBack);
    }

    /**
     * 
     * @param {HTMLElement} elemento 
     * @param {function} callBack 
     */
    let apagarTexto = (elemento , callBack ) => {
        let textElement = elemento.firstChild;
        let text = textElement.nodeValue;

        delayApagarTexto(textElement , text , text.length , 100 , callBack);
    }

    let delayApagarTexto = async (elemento , texto , possicao, delayTempo , callBack) => {

        elemento.nodeValue = texto.substr(0 , possicao);
        possicao--;

        if(possicao >= 0){
            return await setTimeout(() => {

                delayApagarTexto(elemento , texto , possicao , delayTempo , callBack);
            } , delayTempo );

        } else {
            setTimeout(() => {
                callBack();
            } , 500 );
        }
    }

    let delayEscrever = async (elemento , texto , possicao , delayTempo , callBack) => {
        let cache = elemento.innerText; 
        elemento.innerText = `${cache}${texto[possicao]}`;
        possicao++;
        
        if(possicao < texto.length){
            return await setTimeout(() => {

                delayEscrever(elemento , texto , possicao , delayTempo , callBack);
            } , delayTempo );

        } else if (typeof callBack == 'function'){
            setTimeout(()=> {
                callBack();
            } , timeEntreTexto );
        }
    }

    let efeitoBarPiscar = ( cfg , arg , i = 0) => {
        if(i % 2 == 0){
            arg.setAttribute('style' , 'color: white');
        } else {
            arg.setAttribute('style' , `color: ${cfg.barColor}`);
        }

        setTimeout(() => {
            efeitoBarPiscar( cfg , arg , ++i);
        
        } , 350);
    }



    let start = () => {

        api();
    }
 

     typeWrite = start;

    globalThis.typeWrite = typeWrite;

})();