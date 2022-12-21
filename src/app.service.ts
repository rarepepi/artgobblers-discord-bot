import { Injectable } from '@nestjs/common';
const { Webhook, MessageBuilder } = require('discord-webhook-node');
import axios from 'axios';
var cron = require('node-cron');
import { ethers } from 'ethers';

@Injectable()
export class AppService {
  static running = false;
  static txnsToSend = new Set();
  static txnsAlreadySent = new Set();
  static lastBlockProcessed = 0;

  async processArtGlammed() {
    const glamList = await axios.get(
      'https://api.artgobblers.com/api/trpc/user.me,page.recentlyGlaminated?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%7D%7D%2C%221%22%3A%7B%22json%22%3A%7B%22take%22%3A64%7D%7D%7D',
    );
  }

  async processArtGobbled() {
    const gobblersAddress = '0x60bb1e2aa1c9acafb4d34f71585d7e959f387769';
    const gobbleEventHash = ethers.utils.id(
      'ArtGobbled(address,uint256,address,uint256)',
    );
    const lastBlock = parseInt(
      (
        await axios.get(
          `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`,
        )
      ).data.result,
    );

    const txnList = await axios.get(
      `https://api.etherscan.io/api?module=logs&action=getLogs&address=${gobblersAddress}&fromBlock=${AppService.lastBlockProcessed}&toBlock=${lastBlock}&page=1&offset=1000&apikey=${process.env.ETHERSCAN_API_KEY}`,
    );

    const txns = txnList.data.result;
    for (const txn of txns) {
      if (AppService.txnsAlreadySent.has(txn.transactionHash)) {
        continue;
      }
      if (txn.topics[0] === gobbleEventHash) {
        const gobblerTokenId = parseInt(txn.topics[2]);
        const pageTokenId = parseInt(txn.data);
        const gobblerMetadata = (
          await axios.get(
            `https://nfts.artgobblers.com/api/gobblers/${gobblerTokenId}`,
          )
        ).data;
        const pageMetadata = (
          await axios.get(
            `https://nfts.artgobblers.com/api/pages/${pageTokenId}`,
          )
        ).data;

        await this.sendDiscordMessageArtGobbled({
          gobblerId: gobblerTokenId,
          gobblerMetadata,
          pageId: pageTokenId,
          pageMetadata,
        });
        AppService.txnsAlreadySent.add(txn.transactionHash);
      }
    }
    AppService.lastBlockProcessed = lastBlock;
  }

  async sendDiscordMessageGlammed(data: {
    gobblerId: number;
    gobblerMetadata: any;
    pageId: number;
    pageMetadata: any;
  }): Promise<void> {
    const artGlammedTitles = [`It's a masterpiece!`, 'Picaso?'];

    const hook = new Webhook(process.env.DISCORD_WEBHOOK);
    const addressOrEns = data.pageMetadata.attributes[1].value.substring(0, 12);
    const embed = new MessageBuilder()
      .setTitle(
        artGlammedTitles[Math.floor(Math.random() * artGlammedTitles.length)],
      )
      .setURL(`https://artgobblers.com/gobbler/${data.gobblerId}`)
      .setDescription(
        `**${data.gobblerMetadata.name.split(' –')[1]}** just gobbled ***"${
          data.pageMetadata.name.split(' –')[0]
        }"*** by ${addressOrEns}...`,
      )
      .setThumbnail(data.gobblerMetadata.image)
      .setImage(data.pageMetadata.image)
      .setColor(data.pageMetadata.background_color);
    hook.send(embed);
  }

  async sendDiscordMessageArtGobbled(data: {
    gobblerId: number;
    gobblerMetadata: any;
    pageId: number;
    pageMetadata: any;
  }): Promise<void> {
    const hook = new Webhook(process.env.DISCORD_WEBHOOK);
    const artGobbledTitles = [
      'Looks delicious!',
      'Its a feast!',
      'Yum!',
      'Gobble gobble!',
    ];

    const addressOrEns = data.pageMetadata.attributes[1].value.substring(0, 12);
    const embed = new MessageBuilder()
      .setTitle(
        artGobbledTitles[Math.floor(Math.random() * artGobbledTitles.length)],
      )
      .setURL(`https://artgobblers.com/gobbler/${data.gobblerId}`)
      .setDescription(
        `**${data.gobblerMetadata.name.split(' –')[1]}** just gobbled ***"${
          data.pageMetadata.name.split(' –')[0]
        }"*** by ${addressOrEns}...`,
      )
      .setThumbnail(data.gobblerMetadata.image)
      .setImage(data.pageMetadata.image)
      .setColor(data.pageMetadata.background_color);
    hook.send(embed);
  }

  async run(): Promise<string> {
    if (AppService.running) {
      return 'Already running!';
    }

    AppService.lastBlockProcessed =
      parseInt(
        (
          await axios.get(
            `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`,
          )
        ).data.result,
      ) - 10;

    // cron.schedule('*/1 * * * *', async () => {
    await this.processArtGobbled();
    await this.processArtGlammed();
    // });
    AppService.running = true;
    return 'Running!';
  }
}
