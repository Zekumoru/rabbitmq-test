import amqp from 'amqplib';

const receive = async (queue: string) => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: false,
    });

    console.log(
      `[[consumer]] Waiting for messages in ${queue}. To exit, press CTRL+C.`
    );
    await channel.consume(
      queue,
      (message) => {
        console.log(`[[consumer]] Received: ${message?.content.toString()}`);
      },
      {
        noAck: true,
      }
    );
  } catch (error) {
    console.error(error);
  }
};

receive('hello');
