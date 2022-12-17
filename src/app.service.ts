import { Injectable } from '@nestjs/common';
const { Webhook, MessageBuilder } = require('discord-webhook-node');
import axios from 'axios';
var cron = require('node-cron');

@Injectable()
export class AppService {
  static running = false;
  static lastTxnTash = '';
  static txnsToSend = [];
  static txnsAlreadySent = [];
  static tenMinOldBLockNumber = null;

  async sendDiscordMessage(): Promise<void> {
    const hook = new Webhook(process.env.DISCORD_WEBHOOK);
    const embed = new MessageBuilder()
      .setTitle('Wallet transaction detected')
      .setDescription('Wallet address: ')
      .setURL(`https://etherscan.io/address/`)
      .setColor('#32CD32')
      .setTimestamp();
    hook.send(embed);
  }

  async run(): Promise<string> {
    if (AppService.running) {
      return 'Already running!';
    }
    const gobbleTxnSignature = 0x6cfdbcae;
    const glamifcationTxnSignature = 0xc9bddac6;

    cron.schedule('*/1 * * * *', async () => {
      // Get last transaction
      const txnList = await axios.get(``);
      const txns = txnList.data.result;
      const lastTxn = txns[txns.length - 1];

      // Send discord message if txn hash is different
      if (lastTxn.hash !== AppService.lastTxnTash) {
        AppService.lastTxnTash = lastTxn.hash;
        await this.sendDiscordMessage();
      }
    });
    AppService.running = true;

    return 'Running!';
  }
}
