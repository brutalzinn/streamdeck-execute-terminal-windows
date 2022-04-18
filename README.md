[![NuGet](https://img.shields.io/nuget/v/streamdeck-client-csharp.svg?style=flat)](https://www.nuget.org/packages/streamdeck-client-csharp)

## THIS PROJECT IS BASED OF [TyrenDe/streamdeck-client-csharp](https://github.com/TyrenDe/streamdeck-client-csharp)

This project added a button called C# Test Plugin that examines the current user's folder. If the current folder is focused, the user can click the button in the macro deck and execute any command hint in the specified directory.
This means that you can execute commands of Docker, Git Bash and many others that needs be executed in current directory.

Example 1:

1. Create a button C# test plugin 
2. Configure the command text input to  ```start "" "C:\Program Files\Git\bin\git.exe" ```
3. Click on your new button in streamdeck and you will see a git bash opened to your current folder looking.
## License
MIT License

Copyright (c) 2019 Shane DeSeranno

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
