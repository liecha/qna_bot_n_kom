/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var builder_cognitiveservices = require("botbuilder-cognitiveservices");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var AzureWebJobsStorage = 'DefaultEndpointsProtocol=https;AccountName=botnkomqnatest8387;AccountKey=rp7sdvYb4h1C2eZQwG/+g2frjGbfSjby5nN2UplHSGZofeJ0c2RKDWetqJ6UpKsV2paXedFtopqQPGGzjr8/uQ==';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, AzureWebJobsStorage); // DefaultEndpointsProtocol=https;AccountName=botnkomqnatest8387;AccountKey=rp7sdvYb4h1C2eZQwG/+g2frjGbfSjby5nN2UplHSGZofeJ0c2RKDWetqJ6UpKsV2paXedFtopqQPGGzjr8/uQ==;
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

var QnAKnowledgebaseId = '73328861-eaa0-4999-b625-4a81418eb702'
var QnAAuthKey = 'a6674022-1342-497f-9bfd-cdba948b8b21'
var QnAEndpointHostName = 'https://qnabotnkom.azurewebsites.net/qnamaker'

// Recognizer and and Dialog for GA QnAMaker service
var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: QnAKnowledgebaseId,
    authKey: QnAAuthKey,
    endpointHostName: QnAEndpointHostName
});

var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
    defaultMessage: 'No match! Try changing the query terms!',
    qnaThreshold: 0.3
}
);

bot.dialog('basicQnAMakerDialog', basicQnAMakerDialog);

bot.dialog('/', //basicQnAMakerDialog);
    [
        function (session) {
            var qnaKnowledgebaseId = QnAKnowledgebaseId;
            var qnaAuthKey = QnAAuthKey;
            var endpointHostName = QnAEndpointHostName;

            // QnA Subscription Key and KnowledgeBase Id null verification
            if ((qnaAuthKey == null || qnaAuthKey == '') || (qnaKnowledgebaseId == null || qnaKnowledgebaseId == ''))
                session.send('Please set QnAKnowledgebaseId, QnAAuthKey and QnAEndpointHostName (if applicable) in App Settings. Learn how to get them at https://aka.ms/qnaabssetup.');
            else {
                if (endpointHostName == null || endpointHostName == '')
                    // Replace with Preview QnAMakerDialog service
                    session.replaceDialog('basicQnAMakerPreviewDialog');
                else
                    // Replace with GA QnAMakerDialog service
                    session.replaceDialog('basicQnAMakerDialog');
            }
        }
    ]);

function getSampleCardImages(session) {
    return [
        builder.CardImage.create(session, 'https://www.iconsdb.com/icons/preview/orange/chat-xxl.png')
    ];
}

// Change password in Heroma
bot.dialog('changePassword', [
    function (session) {
        const card = new builder.ThumbnailCard(session)
            .title(' ')
            .subtitle('För att kunna hjälpa dig ytterligare behöver jag veta om du är chef eller lönerapportör.')
            .text('Är du chef eller lönerapportör?')
            .images(getSampleCardImages(session))
            .buttons([
                builder.CardAction.imBack(session, "Jag är chef eller lönerapportör.", "JA"),
                builder.CardAction.imBack(session, "Jag är inte chef eller lönerapportör.", "NEJ"),
            ]);
            const myMessage = new builder.Message(session).addAttachment(card);
            session.endConversation(myMessage);
        }
]).triggerAction( { matches: /lösenord/ } );


// Change password in Heroma - YES im a boss
bot.dialog('Ja', [
    function (session) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.list)
        msg.attachments([
            new builder.ThumbnailCard(session)
                .title(' ')
                .subtitle('För att få ett nytt lösenord till Heroma som chef/lönerapportör behöver du kontakta LK-data.')
                .text('LK-data: 013 - 20 69 69')
                .images(getSampleCardImages(session)),
            new builder.ThumbnailCard(session)
                .title(' ')
                .subtitle('Är du nöjd med den hjälp du fått?')
                .buttons([
                    builder.CardAction.imBack(session, "Jag är nöjd med din hjälp - tack och på återseende!", "JA"),
                    builder.CardAction.imBack(session, "Jag är inte nöjd.", "NEJ"),
                ])
            ]);
        session.send(msg)
    }
]).triggerAction( { matches: /Jag är chef/ } );

// Change password in Heroma - NO im not a boss
bot.dialog('Nej', [
    function (session) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.list)
        msg.attachments([
            new builder.ThumbnailCard(session)
                .title(' ')
                .subtitle('För att få ett nytt lösenord till Heroma behöver du kontakta din lönerapportör.')
                .images(getSampleCardImages(session)),
            new builder.ThumbnailCard(session)
                .title(' ')
                .subtitle('Är du nöjd med den hjälp du fått?')
                .buttons([
                    builder.CardAction.imBack(session, "Jag är nöjd med din hjälp - tack och på återseende!", "JA"),
                    builder.CardAction.imBack(session, "Jag är inte nöjd.", "NEJ"),
                ])
            ]);
        session.send(msg)
    }
]).triggerAction( { matches: /Jag är inte/ } );

// Get information about GDPR
bot.dialog('infoAboutGdpr', [
    function (session) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.list)
        msg.attachments([
            new builder.ThumbnailCard(session)
                .title(' ')
                .subtitle('Tyck på knappen "Info GDPR" nedan för att få mer information. Läs exempelvis om vem som är ansvarig för GDPR eller vem som är dataskyddsombud.')
                .images(getSampleCardImages(session))
                .buttons([
                    builder.CardAction.openUrl(session, "http://www.norrkoping.se/dataskyddsforordningen---gdpr.html", "Info GDPR"),
                ]),
            new builder.ThumbnailCard(session)
                .title(' ')
                .subtitle('Är du nöjd med den hjälp du fått?')
                .buttons([
                    builder.CardAction.imBack(session, "Jag är nöjd med din hjälp - tack och på återseende!", "JA"),
                    builder.CardAction.imBack(session, "Jag är inte nöjd.", "NEJ"),
                ])
            ]);
        session.send(msg)
    }
]).triggerAction( { matches: /GDPR/ } );

// Want to reach mail box from home
bot.dialog('reachMailFromHome', [
    function (session) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.list)
        msg.attachments([
            new builder.ThumbnailCard(session)
                .title(' ')
                .subtitle('Tyck på knappen "Webmail" nedan för att nå mailen hemifrån. Logga in med ditt användarid och tillhörande lösenord.')
                .images(getSampleCardImages(session))
                .buttons([
                    builder.CardAction.openUrl(session, "https://epost.norrkoping.se/", "Webmail"),
                ]),
            new builder.ThumbnailCard(session)
                .title(' ')
                .subtitle('Är du nöjd med den hjälp du fått?')
                .buttons([
                    builder.CardAction.imBack(session, "Jag är nöjd med din hjälp - tack och på återseende!", "JA"),
                    builder.CardAction.imBack(session, "Jag är inte nöjd.", "NEJ"),
                ])
            ]);
        session.send(msg)
    }
]).triggerAction( { matches: /mail hemifrån/} );

// Happy with answer
bot.dialog('happy', [
    function (session) {
        const card = new builder.ThumbnailCard(session)
            .title(' ')
            .subtitle('Tack själv - på återseende.')
            .images(getSampleCardImages(session))
            const myMessage = new builder.Message(session).addAttachment(card);
            session.endConversation(myMessage);
    }
]).triggerAction( { matches: /Jag är nöjd med din hjälp/ } );

// NOT happy with answer
bot.dialog('notHappy', [
    function (session) {
        const card = new builder.ThumbnailCard(session)
                .title(' ')
                .subtitle('Låt oss titta på alternativen en gång till och se om jag kan hjälpa dig bättre denna gången.')
                .text('Vad önskar du få hjälp med?')
                .images(getSampleCardImages(session))
                .buttons([
                    builder.CardAction.imBack(session, "Jag vill byta lösenord till Heroma.", "Byta lösenord till Heroma"),
                    builder.CardAction.imBack(session, "Jag vill få information kring GDPR.", "Information kring GDPR"),
                    builder.CardAction.imBack(session, "Jag vill nå min mail hemifrån.", "Nå mail hemifrån")
                ]);
            const myMessage = new builder.Message(session).addAttachment(card);
            session.endConversation(myMessage);
    }
]).triggerAction( { matches: /Jag är inte nöjd/ } );
