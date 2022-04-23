using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using uPLibrary.Networking.M2Mqtt;
using uPLibrary.Networking.M2Mqtt.Messages;

namespace TestPlugin
{

    public class MQTT
    {
        private MqttClient mqttClient;

        public static event EventHandler<MessageEventArgs> EventTriggered;

        public MQTT(string host,string username, string password, string error_topic, string id = "")
        {
            mqttClient = new MqttClient(host);
            mqttClient.MqttMsgPublishReceived += MqttClient_MqttMsgPublishReceived;
            mqttClient.Subscribe(new string[] { error_topic }, new byte[] { MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE });
            mqttClient.Connect(id, username, password);
        }
        private void MqttClient_MqttMsgPublishReceived(object sender, uPLibrary.Networking.M2Mqtt.Messages.MqttMsgPublishEventArgs e)
        {
            var message = Encoding.UTF8.GetString(e.Message);
            if (EventTriggered != null)
            {
                EventTriggered(null, new MessageEventArgs { Message = message });
            }
        }

        public void SendMessage(string topic, string message)
        {
            Task.Run(() =>
            {
                if (mqttClient != null && mqttClient.IsConnected)
                {
                    mqttClient.Publish(topic, Encoding.UTF8.GetBytes(message));
                }
            });
            // Disconnect();
        }

        private void Disconnect()
        {
            mqttClient.Disconnect();
        }
    }
}
