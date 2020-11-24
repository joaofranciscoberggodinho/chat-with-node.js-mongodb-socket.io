//Chamando o MongoDB e a biblioteca Socket.io
const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//Conectar com o mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    //Conexão com o Socket.io
    client.on('connection', function(socket){
        let chat = db.collection('chats');

        //Função para enviar o status
        sendStatus = function(s){
            socket.emit('status', s);
        }

        //Lidando com os dados do input
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            //Verifica se os dados foram inseridos
            if(name == '' || message == ''){
                sendStatus('INSIRA OS DADOS CORRETAMENTE');
            } else {
                //Insere a mensagem no banco de dados
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);

                    //Envia o status do obejto
                    sendStatus({
                        message: 'Mensagem enviada com sucesso!',
                        clear: true
                    });
                });
            }
        });        

        //Fazendo a busca das mensagens no banco de dados
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            //Emite a mensagem
            socket.emit('output', res);
        });

        //Função para limpar o chat
        socket.on('clear', function(data){
            chat.remove({}, function(){
                socket.emit('cleared');
            });
        });
    });
});