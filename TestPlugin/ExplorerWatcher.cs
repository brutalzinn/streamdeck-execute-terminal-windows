using SHDocVw;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace TestPlugin
{
    public static class ExplorerWatcher
    {
        // COM Imports

        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

        public static string GetActiveExplorerPath()
        {
            // get the active window
            IntPtr handle = GetForegroundWindow();

            // Required ref: SHDocVw (Microsoft Internet Controls COM Object) - C:\Windows\system32\ShDocVw.dll
            ShellWindows shellWindows = new SHDocVw.ShellWindows();

            // loop through all windows
            foreach (InternetExplorer window in shellWindows)
            {
                // match active window
                if (window.HWND == (int)handle)
                {
                    // Required ref: Shell32 - C:\Windows\system32\Shell32.dll
                    var shellWindow = window.Document as Shell32.IShellFolderViewDual2;

                    // will be null if you are in Internet Explorer for example
                    if (shellWindow != null)
                    {
                        // Item without an index returns the current object
                        var currentFolder = shellWindow.Folder.Items().Item();

                        // special folder - use window title
                        // for some reason on "Desktop" gives null
                        if (currentFolder == null || currentFolder.Path.StartsWith("::"))
                        {
                            // Get window title instead
                            const int nChars = 256;
                            StringBuilder Buff = new StringBuilder(nChars);
                            if (GetWindowText(handle, Buff, nChars) > 0)
                            {
                                return Buff.ToString();
                            }
                        }
                        else
                        {
                            return currentFolder.Path;
                        }
                    }

                    break;
                }
            }

            return null;
        }

        public static string RunCommand(string directory, string arguments, bool readOutput = false)
        {
            var output = string.Empty;
            try
            {
                var startInfo = new ProcessStartInfo
                {
                    Verb = "runas",
                    FileName = "cmd.exe",
                    Arguments = "/C " + arguments,
                    WorkingDirectory = directory,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = false
                };

                var proc = Process.Start(startInfo);

                if (readOutput)
                {
                    output = proc.StandardOutput.ReadToEnd();
                }

                proc.WaitForExit(60000);

                return output;
            }
            catch (Exception)
            {
                return output;
            }
        }


    }
}
