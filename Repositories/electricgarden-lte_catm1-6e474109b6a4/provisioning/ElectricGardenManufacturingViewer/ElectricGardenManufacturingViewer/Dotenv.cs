using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows.Forms;


namespace ElectricGardenManufacturingViewer
{
    public class DotEnv
    {
        public void LoadEnv()
        {
            LoadEnvIn(Directory.GetCurrentDirectory());

        }

        private void LoadEnvIn(string folder)
        {
            bool devFile = LoadEnvFileAt(Path.Combine(folder, ".env.development"));
            bool prodFile = LoadEnvFileAt(Path.Combine(folder, ".env"));
            bool fileExists =  devFile || prodFile;
            if( !fileExists ){
                string parent = Path.GetDirectoryName(folder);
                if( parent != folder && Directory.Exists(parent)){
                    LoadEnvIn(parent);
                }
            }
        }


        private bool LoadEnvFileAt(string filename)
        {
            if (File.Exists(filename))
            {
                var lines = File.ReadAllLines(filename);
                var values = 
                    lines
                    .Select(CheckLine)
                    .Where(x => x != null)
                    .Select(ParseLine)
                    .Select(LoadIntoEnv)
                    .ToList();
                return true;
            }
            return false;
        }

        private string CheckLine(string line){
            string trimmed = line.Split('#')[0].Trim();
            if(String.IsNullOrWhiteSpace(trimmed)){
                return null;
            }
            if(trimmed.IndexOf('=') < 1){
                return null;
            }
            return trimmed;
        }
        private KeyValuePair<string,string> ParseLine(string line){
            var splitAt = line.IndexOf('=');
            return new KeyValuePair<string,string>(line.Substring(0,splitAt), line.Substring(splitAt + 1));
        }

        private  KeyValuePair<string,string> LoadIntoEnv(KeyValuePair<string,string> setting){
            Environment.SetEnvironmentVariable(setting.Key, setting.Value);
            return setting;
        }
    }
}