(function(){
    var element = function(id){
        return document.getElementById(id);
    }

    //Pega os elementos do input
    var status = element('status');
    var messages = element('messages');
    var textarea = element('textarea');
    var username = element('username');
    var clearBtn = element('clear');

    //Seta o status default
    var statusDefault = status.textContent;

    var setStatus = function(s){
        status.textContent = s;

        if(s !== statusDefault){
            var delay = setTimeout(function(){
                setStatus(statusDefault);
            }, 4000);
        }
    }

    //Conecta com o socket.io
    var socket = io.connect('127.0.0.1:4000');

    //Verifica a conexão
    if(socket !== undefined){
        console.log('Conectado ao Socket');

        socket.on('output', function(data){
            if(data.length){
                for(var i = 0;i < data.length;i++){
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[i].name+": "+data[i].message;
                    messages.appendChild(message);
                }
            }
        });

        //Pega o status do servidor
        socket.on('status', function(data){
            setStatus((typeof data === 'object')? data.message : data);

            //Operação para limpar o chat
            if(data.clear){
                textarea.value = '';
            }
        });

        //Enviar mensagem ao pressionar enter
        textarea.addEventListener('keydown', function(event){
            if(event.which === 13 && event.shiftKey == false){
                // Emit to server input
                socket.emit('input', {
                    name:username.value,
                    message:textarea.value
                });

                event.preventDefault();
            }
        })

        //Emite o clear
        clearBtn.addEventListener('click', function(){
            socket.emit('clear');
        });

        //Limpa o chat
        socket.on('cleared', function(){
            messages.textContent = '';
        });
    }

})();