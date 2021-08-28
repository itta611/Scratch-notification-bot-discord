const Discord = require('discord.js');
const fs = require("fs");
const https = require('https');
let enableUsers = [];
const client = new Discord.Client({intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_REACTIONS']});
client.on('guildCreate', guild => {
  client.user.setActivity('`sn-enable`コマンドで有効化', {
    type: 'PLAYING'
  });
});
fs.readFile("users.json", "utf-8", (err, data) => {
  if (err) throw err;
  enableUsers = JSON.parse(data);
});
client.on('messageCreate', message => {
  if (message.author.bot){
    return;
  }
  let thisUserEnabledID = enableUsers.findIndex(function(elm) {return elm[0] === message.author.id});
  if (message.content.substring(0, 10) === 'sn-enable ') {
    if (thisUserEnabledID !== -1 && thisUserEnabledID !== undefined) {
      message.channel.send(`${enableUsers[thisUserEnabledID][1]}さんのScratch通知はもともと有効です。\n無効にするには${'`sn-unable`'}コマンドを利用してください。`);
    } else {
      enableUsers.push([message.author.id, message.content.substring(10), 0]);
      updateEnabledUser();
      message.channel.send(`${message.content.substring(10)}さんのScratch通知を有効にしました！`);
    }
    return;
  }
  if (message.content === 'sn-unable') {
    if (thisUserEnabledID !== -1) {
      updateEnabledUser();
      message.channel.send(`${enableUsers[thisUserEnabledID][1]}さんのScratch通知を無効にします！`);
    } else {
      message.channel.send(`${enableUsers[thisUserEnabledID][1]}さんのScratch通知はもともと無効です。\n有効にするには${'`sn-enable 【ここにユーザー名】`'}コマンドを利用してください。`);
    }
    enableUsers.pop(thisUserEnabledID);
    return;
  }
  if (thisUserEnabledID !== -1) {
    https.get(`https://api.scratch.mit.edu/users/${enableUsers[thisUserEnabledID][1]}/messages/count`, function(response) {
      let data = '';
      response.on('data', (chunk) => {
          data += chunk;
      });
      response.on('end', () => {
          let scratchNotificationCount = JSON.parse(data).count;
          if (
            scratchNotificationCount === enableUsers[thisUserEnabledID][2] ||
            scratchNotificationCount === 0
          ) return;
          enableUsers[thisUserEnabledID][2] = scratchNotificationCount;
          updateEnabledUser();
          message.react('🔔');
          let numbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
          scratchNotificationCount += '';
          for (let i = 0; i < scratchNotificationCount.length; i++) {
            message.react(numbers[scratchNotificationCount[i] * 1]);
          }
      });
    });
  }
});

function updateEnabledUser() {
  let writeText = JSON.stringify(enableUsers);
  fs.open("users.json", "a", (err, fd) => {
    if (err) throw err;
    fs.write(fd, writeText, 0, (err) => {
      if (err) throw err;
      fs.close(fd, (err) => {
        if (err) throw err;
      });
    });
  });
}

client.on('messageReactionAdd', async (reaction, user) => {
  console.log(`${reaction.message.guild} で ${user.tag} が ${reaction.emoji.name} をリアクションしました`)
})

client.login('ODgwNjQ5MDYwMTEyMDExMzI3.YShWWQ.IFppyR7zbfDUoApG1t8Plc2-upI');