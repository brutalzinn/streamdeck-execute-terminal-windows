using System.Net.Http;
using System.Net;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text;

namespace TestPlugin
{
    public class ArduinoRequest
    {

        public bool TurnOn(string url, ColorPicker color) => CallAPI(url, $"{{ \"red\" : {color.red}, \"green\": {color.green}, \"blue\": {color.blue} }}") == HttpStatusCode.OK;
        
        private  HttpClient _client { get; set; }
            
        public ArduinoRequest()
        {
            _client = new HttpClient();
        }

        private HttpStatusCode CallAPI(string url, string body)
        {
            var data = new System.Net.Http.StringContent(body, Encoding.UTF8, "application/json");
            var response =  Task.Run(() => _client.PostAsync(url, data)).Result;
            return response.StatusCode;
        }

    }
}
