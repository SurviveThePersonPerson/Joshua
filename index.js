const Discord = require("discord.js");
const chalk = require("chalk");
const green = chalk.green;
const blue = chalk.blue;
const red = chalk.red;
const bot = new Discord.Client();
const request = require('snekfetch');
const config = require("./config.json");
var eventCounter = 0;
const apiKEY = config.apiKEY;
const fs = require("fs");
const token = config.token;

console.log(green("[LOGS] Connecting to the Discord Client."));

var functions = {
    rcol: () => {
      return Math.round(Math.random() * 16777215);
    },// Random color
    ec: (string) => {
      if (typeof(string) === "string")
        return string.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
      else
        return string;
    },
      mtc: (ms) => {
      let x = ms / 1000;
      let s = Math.floor(x % 60);
      x /= 60;
      let m = Math.floor(x % 60);
      x /= 60;
      let h = Math.floor(x % 24);
      return `${h > 0 ? h + ":" : ""}${h > 0 ? (m > 9 ? m : "0" + m) : m}:${s > 9 ? s : "0" + s}`
    },// Turns milliseconds into time
    mtrl: (milliseconds) => {
      let x = milliseconds / 1000;
      let s = Math.floor(x % 60);
      x /= 60;
      let m = Math.floor(x % 60);
      x /= 60;
      let h = Math.floor(x % 24);
      x /= 24;
      let d = Math.floor(x);
  
      //Shortens the time message by clearing unnecessary things
      let timeStuff = "";
      if (d > 0){
        timeStuff += `${d} day${(d > 1 ? "s" : "") + ((h > 0 || m > 0 || s > 0) ? ", " : "")}, `;
      }
      if (h > 0){
        timeStuff += `${h} hour${(h > 1 ? "s" : "") + ((m > 0 || s > 0) ? ", " : "")}`;
      }
      if (m > 0){
        timeStuff += `${m} minute${(m > 1 ? "s" : "")  + (s > 0 ? ", " : "")}`;
      }
      if (s > 0) {
        timeStuff += `${(d > 0 || h > 0 || m > 0) ? "and " : ""}${s} second${s > 1 ? "s" : ""}`;
      }
      return timeStuff;
    },
    sti: (string) => {
      return string.replace(/[^0-9]/g, "");
    },
}


bot.on("ready", () => {
    console.log(green("[LOGS] Succesfuully connected to Discord."));
    console.log(blue(`\nUsers: ${bot.users.size}\nGuilds: ${bot.guilds.size}\nChannels: ${bot.channels.size}\n`));
    console.log("Logging is now finished, Joshua should be working correctly.\n");
    eventCounter = eventCounter + 1;
});

bot.on("disconnect", () => {
    console.log(red("[ERROR] Bot Disconnected"));
});

bot.on("reconnecting", () => {
    console.log(green("[LOGS] Attempting to reconnect..."));
})

bot.on("error", e => {
    console.log(red(`[ERROR] ${e}`));
});


bot.on("message", async message => {
    eventCounter = eventCounter + 1;

    if(bot.ping > 250) return console.log(red("[WARNING] Joshua's ping is greater then 250!"));

    if(message.channel.type === `dm`) return;
    if(message.author.type === `bot`) return;

    let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));

    if(!prefixes[message.guild.id]){
        prefixes[message.guild.id] = {
            prefixes: config.prefix
        };
    }

    let prefix = prefixes[message.guild.id].prefixes;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    //FUN COMMANDS

    if(cmd === `${prefix}advice`){
        if(args[0] == "help"){
            let adviceHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Advice\n**Usage**: `j!advice`\n**Description**: `Joshua will give you some advice.`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(adviceHelp)
        }else
        {

        }
        request.get('https://api.badosz.com/advice').set({Authorization: apiKEY}).then(async response => {
            const text = JSON.parse(response.text);
            console.log(response.text);
            return message.channel.send(text.advice);
        });
    }

    if(cmd === `${prefix}note`){
        if(args[0] == "help"){
            let noteHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Note\n**Usage**: `j!note <text>`\n**Description**: `Joshua will create a note with the text you entered.`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(noteHelp)
        }else
        {
            if(!args) return message.channel.send("**Error**: *Incorrect Ussage*, Please format with `j!note <text>` or `j!note help`");
            request.get(`https://api.badosz.com/note?text=${args.join(" ")}`).set({Authorization: apiKEY}).then(async response => {
                console.log(response.body);
                const buffer = response.body
                let notemsg = new Discord.Attachment()
                .setFile(buffer);
                message.channel.send(notemsg);
            });
        }
    }

    if(cmd === `${prefix}wasted`){
        if(args[0] == "help"){
            let wastedHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Wasted\n**Usage**: `j!wasted <@user>`\n**Description**: `Sends GTA wasted of the user`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(wastedHelp)
        }else
        {
            let DatUser =  message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
            if(!DatUser) return message.channel.send("**Error**: *Incorrect Ussage*, Please format with `j!wasted <@user>` or `j!wasted help`");
            request.get(`https://api.badosz.com/wasted?url=${DatUser.user.avatarURL}`).set({Authorization: apiKEY}).then(async response => {
                console.log(response.body);
                const buffer = response.body
                let wastedmsg = new Discord.Attachment()
                .setFile(buffer);
                message.channel.send(wastedmsg);
            });
        }
    }

    if(cmd === `${prefix}chucknorris`){
        if(args[0] == "help"){
            let chucknorrisHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Chucknorris\n**Usage**: `j!chucknorris`\n**Description**: `Joshua will give you a random Chuck Norris joke.`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(chucknorrisHelp)
        }else
        {
            request.get('https://api.badosz.com/chucknorris').set({Authorization: apiKEY}).then(async response => {
                const text = JSON.parse(response.text);
                console.log(response.text);
                return message.channel.send(text.joke);
            });
        }
    }

    if(cmd === `${prefix}dadjoke`){
        if(args[0] == "help"){
            let dadjokeHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Dadjoke\n**Usage**: `j!dadjoke`\n**Description**: `Joshua will give you a random dad joke.`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(dadjokeHelp)
        }else
        {
            request.get('https://api.badosz.com/dadjoke').set({Authorization: apiKEY}).then(async response => {
                const text = JSON.parse(response.text);
                console.log(response.text);
                return message.channel.send(text.joke);
            });
        }
    }

    if(cmd === `${prefix}invert`){
        if(args[0] == "help"){
            let inverthelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Invert\n**Usage**: `j!wasted <@user>`\n**Description**: `Inverts mentioned users avatar`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(inverthelp)
        }else
        {
            let DatUser =  message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
            if(!DatUser) return message.channel.send("**Error**: *Incorrect Ussage*, Please format with `j!invert <@user>` or `j!invert help`");
            request.get(`https://api.badosz.com/invert?url=${DatUser.user.avatarURL}`).set({Authorization: apiKEY}).then(async response => {
                console.log(response.body);
                const buffer = response.body
                let wastedmsg = new Discord.Attachment()
                .setFile(buffer);
                message.channel.send(wastedmsg);
            });
        }
    }

    if(cmd === `${prefix}blurple`){
        if(args[0] == "help"){
            let blurpleHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Blurple\n**Usage**: `j!blurple <@user>`\n**Description**: `Makes mentioned users avatar blue and purple.`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(blurpleHelp)
        }else
        {
            let DatUser =  message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
            if(!DatUser) return message.channel.send("**Error**: *Incorrect Ussage*, Please format with `j!blurple <@user>` or `j!blurple help`");
            request.get(`https://api.badosz.com/blurple?url=${DatUser.user.avatarURL}`).set({Authorization: apiKEY}).then(async response => {
                console.log(response.body);
                const buffer = response.body
                let wastedmsg = new Discord.Attachment()
                .setFile(buffer);
                message.channel.send(wastedmsg);
            });
        }
    }

    if(cmd === `${prefix}fact`){
        if(args[0] == "help"){
            let factHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Fact\n**Usage**: `j!fact`\n**Description**: `Joshua will give you a random fact.`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(factHelp)
        }else
        {
            request.get('https://api.badosz.com/fact').set({Authorization: apiKEY}).then(async response => {
                const text = JSON.parse(response.text);
                console.log(response.text);
                return message.channel.send(text.fact);
            });
        }
    }

    if(cmd === `${prefix}why`){
        if(args[0] == "help"){
            let whyHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Why\n**Usage**: `j!why`\n**Description**: `Joshua will give you something to think about.`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(whyHelp)
        }else
        {
            request.get('https://api.badosz.com/why').set({Authorization: apiKEY}).then(async response => {
                const text = JSON.parse(response.text);
                console.log(response.text);
                return message.channel.send(text.why);
            });
        }
    }

    if(cmd === `${prefix}yomama`){
        if(args[0] == "help"){
            let yomamaHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Yomama\n**Usage**: `j!yomama`\n**Description**: `Joshua will send you a random yo mama joke.`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(yomamaHelp)
        }else
        {
            request.get('https://api.badosz.com/yomomma').set({Authorization: apiKEY}).then(async response => {
                const joke = JSON.parse(response.text);
                console.log(response.text);
                return message.channel.send(joke.joke);
            });
        }
    }

    if(cmd === `${prefix}say`){
        if(args[0] == "help"){
            let sayHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Say\n**Usage**: `j!say <text>`\n**Description**: `Joshua says what you say!`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
            return message.channel.send(sayHelp)
        }else
        {
            const sayMessage = args.join(" ");
            message.delete().catch();
            message.channel.send(sayMessage);
        }
    }

    //General Commands
    if(cmd === `${prefix}prefix`){
        if(!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(`**Insufficient Permissions**: You are missing the permissions ` + "`MANAGE_GUILD`");
        if(!args[0] || args[0 == 'help']) return message.channel.send("**Error**: *Incorrect Ussage*, Please format with `j!prefix <prefix>` or `j!prefix help`");

        if(args[0] == "help"){
            let prefixHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Prefix\n**Usage**: `j!prefix <prefix>`\n**Description**: `This command will change Joshua's prefix for your server.`\n**Permissions**: `MANAGE_GUILD`")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);

            return message.channel.send(prefixHelp);
        }else
        {
            prefixes[message.guild.id] = {
                prefixes: args[0]
            };
    
            fs.writeFile("./prefixes.json", JSON.stringify(prefixes), (err) => {
                if (err) console.log(err);
            });
    
            let prefixEmbed = new Discord.RichEmbed()
            .setTitle("Prefix Changed")
            .setDescription(`Changed to ${args[0]}`)
            .setColor("40e0d0")
            .setTimestamp()
            .setFooter(`Changed by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
    
            return message.channel.send(prefixEmbed);
        }
    }

    if(cmd === `${prefix}ping`){
        if(args[0] == "help"){
            let pingHelp = new Discord.RichEmbed()
            .setTitle("Help")
            .setDescription("**Name**: Ping\n**Usage**: `j!ping`\n**Description**: `This command shows Joshua's speed/ping.`\n**Permissions**: ")
            .setColor("#800000")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);

            return message.channel.send(pingHelp);
        }else
        {
            let pingEmbed = new Discord.RichEmbed()
            .setColor("00ffff")
            .setTitle("Ping")
            .setDescription(`Pong! ${bot.ping}`)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);
    
            message.channel.send(pingEmbed);
        }
    }

    if(cmd === `${prefix}info`){
        let botiEmbed = new Discord.RichEmbed()
        .setColor("48d1cc")
        .setAuthor("Bot Information", bot.user.avatarURL)
        .addField("<:info:528365371166687232>Bot Info", `**Servers**: ${bot.guilds.size}\n**Users**: ${bot.users.size}\n**Channels**: ${bot.channels.size}\n**Client ID**: ${bot.user.id}\n**Uptime**: ${functions.mtrl(bot.uptime)}`)
        .addField("<:botfloppydisk:539872932113940538>Bot Process Info", `**Discord.js Version**: ${Discord.version}\n**Node.js Version**: ${process.version}\n**Memory Used**: ${(process.memoryUsage().heapUsed / 1048576).toFixed(2)}MB`)
        .addField(":page_facing_up:Credits","<@252416364302696450> - Bot Owner/Developer\n<@335894501870665730> - Helper/Tester")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);

        return message.channel.send(botiEmbed);
    }

    if(cmd === `${prefix}help`){
        let helpHelp = new Discord.RichEmbed()
        .setAuthor("Joshua's Help Menu", bot.user.avatarURL)
        .setTitle("Commands [15]")
        .setDescription("For more info on a command, run `j!command help` :page_facing_up:")
        .addField("Fun [11]", "`advice`, `yomama`, `why`, `dadjoke`, `chucknorris`, `fact`, `note`, `wasted`, `say`, `invert`, `blurple`")
        .addField("General [4]", "`info`, `ping`, `prefix`, `updatelogs`")
	.addField("Moderation [0]", "none")
        .setColor("#800000")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.username}${message.author.discriminator}`, message.author.avatarURL);

        return message.channel.send(helpHelp);
    }

    if(cmd === `${prefix}updatelogs`){
        return message.channel.send("**v0.0.0** `Beta Testing.`\n")
    }

});

bot.on("messageDelete", async message => {
    eventCounter = eventCounter + 1;
});

bot.on("messageUpdate", async message => {
    eventCounter = eventCounter + 1;
});

bot.on("messageDeleteBulk", async message => {
    eventCounter = eventCounter + 1;
});

bot.on("messageReactionAdd", () => {
    eventCounter = eventCounter + 1;
})

bot.on("messageReactionRemove", () => {
    eventCounter = eventCounter + 1;
});

bot.on("messageReactionRemoveAll", () => {
    eventCounter = eventCounter + 1;
});


bot.login(token);
