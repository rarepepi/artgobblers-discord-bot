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
  static lastBlockProcessed = 16203000;

  async sendDiscordMessage(data: {
    gobblerId: number;
    gobblerMetadata: any;
    pageId: number;
    pageMetadata: any;
  }): Promise<void> {
    const hook = new Webhook(process.env.DISCORD_WEBHOOK);
    const embed = new MessageBuilder()
      .setTitle(`${data.pageMetadata.name.split(' –')[0]} was gobbled!`)
      .setURL(`https://artgobblers.com/gobbler/${data.gobblerId}`)
      .setDescription(
        `Gobbler ${data.gobblerId} ${
          data.gobblerMetadata.name.split(' –')[1]
        } gobbled Page ${data.pageId}`,
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
    const gobblersAddress = '0x60bb1e2aa1c9acafb4d34f71585d7e959f387769';
    const gobbleEventHash = ethers.utils.id(
      'ArtGobbled(address,uint256,address,uint256)',
    );
    // const lastBlock = parseInt(
    //   (
    //     await axios.get(
    //       'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}',
    //     )
    //   ).data.result,
    // );
    const lastBlock = 16206244;

    // cron.schedule('*/1 * * * *', async () => {
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

        await this.sendDiscordMessage({
          gobblerId: gobblerTokenId,
          gobblerMetadata,
          pageId: pageTokenId,
          pageMetadata,
        });
        AppService.txnsAlreadySent.add(txn.transactionHash);
      }
    }
    AppService.lastBlockProcessed = lastBlock;
    // });
    AppService.running = true;
    return 'Running!';
  }
}
