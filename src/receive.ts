import amqp from 'amqplib';

const timer = async (seconds: number, logging = true) => {
  await new Promise((resolve) => {
    let elapsedSeconds = 1;
    const interval = setInterval(() => {
      if (logging)
        console.log(`Elapsed ${elapsedSeconds} of ${seconds} seconds`);

      if (elapsedSeconds >= seconds) {
        clearInterval(interval);
        resolve(0);
      } else {
        elapsedSeconds++;
      }
    }, 1000);
  });
};

const list: amqp.ConsumeMessage[] = [];
let isProcessing = false;
const processList = async (channel: amqp.Channel) => {
  if (isProcessing) return;
  if (list.length === 0) return;

  isProcessing = true;

  const messages: amqp.ConsumeMessage[] = [];
  while (list.length) messages.push(list.shift()!);

  const texts = messages.map((message) => message.content.toString());
  console.log(`[[consumer]] Processing`);
  console.log(texts);

  await timer(7);

  channel.ack(messages[messages.length - 1], true);
  console.log(`[[consumer]] Done`);

  isProcessing = false;
  processList(channel); // start processing again
};

const receive = async (queue: string) => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    console.log(
      `[[consumer]] Waiting for messages in ${queue}. To exit, press CTRL+C.`
    );

    // 1. let the consumer consumes WITHOUT acknowledging the requests
    // 2. put it in a list
    // 3. process this list (should be one element at first)
    // 4. when processing is done, take all of the list again

    channel.consume(
      queue,
      (message) => {
        if (!message) return;
        list.push(message);
        setTimeout(() => processList(channel), 100); // slow down to get all in the queues
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.error(error);
  }
};

receive('task_queue');
