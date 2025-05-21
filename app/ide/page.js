"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { loader, useMonaco } from '@monaco-editor/react';
import "monaco-themes/themes/GitHub Dark.json";
import { addAbortListener } from "events";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function IDE() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [orgId, setOrgId] = useState("");
  const [entId, setEntId] = useState("");
  const [plantId, setPlantId] = useState("");
  const [connectionString, setConnectionString] = useState("");
  const [host, setHost] = useState("localhost:8686");
  const [selectedHost, setSelectedHost] = useState("LOCAL");
  const [selectedOption, setSelectedOption] = useState("none");
  const [uFID, setUFID] = useState("undefined");
  const [isConnected, setIsConnected] = useState(false);
  const [URL, setURL] = useState("");
  const [project, setProject] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [msgLog, setMsgLog] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [theme, setTheme] = useState("monokai");

  const wsRef = useRef(null);
  const editorRef = useRef(null);

  const handleConnect = () => {
    if (typeof window === 'undefined') return; // Guard clause for SSR

    if (isConnected) {
      // Disconnect if already connected
      if (wsRef.current) {
        wsRef.current.close();
      }
      setIsConnected(false);
      console.log(`Disconnected from WebSocket: ${host + '/' + connectionString}`);
    } else {
      // Connect if not connected
      if (wsRef.current) {
        wsRef.current.close();
      }

      try {
        wsRef.current = new WebSocket('ws://' + host + '/' + connectionString);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          console.log(`Connected to WebSocket: ${host + '/' + connectionString}`);
        };

        wsRef.current.onmessage = (event) => {
          addMessage("Received message:", event.data);
          console.log("Received message:", event.data);
          try {
            const parsedData = JSON.parse(event.data);
            setMsgLog(parsedData);
            console.log("Parsed message:", parsedData);
          } catch (error) {
            console.error("Failed to parse message:", error);
          }
        };

        wsRef.current.onerror = (error) => {
          addMessage(`WebSocket error for ${host + '/' + connectionString}:`, error);
          console.error(`WebSocket error for ${host + '/' + connectionString}:`, error);
          setIsConnected(false);
        };

        wsRef.current.onclose = () => {
          addMessage(`Disconnected from WebSocket: ${host + '/' + connectionString}`);
          console.log(`Disconnected from WebSocket: ${host + '/' + connectionString}`);
          setIsConnected(false);
        };
      } catch (error) {
        addMessage(`Failed to connect to ${host + '/' + connectionString}:`, error);
        console.error(`Failed to connect to ${host + '/' + connectionString}:`, error);
        setIsConnected(false);
      }
    }
  };

  const addMessage = (newMessage) => {
    const now = new Date().toLocaleTimeString();
    newMessage = `${now}: ${newMessage.trim()}`;
    setSentMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, (e) => {
      handleSubmit(e);
    });
  };

  useEffect(() => {
    console.log("Loading Monaco Editor...");
    loader.init().then(monaco => {
      monaco.editor.defineTheme('dimTheme', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#f3f4f6', // This is a light gray color (Tailwind's gray-100)
        }
      });
    });

    importMonacoThemes();

    // Load settings from localStorage
    console.log("Loading settings from localStorage...");
    setUsername(localStorage.getItem("username") || "veolia@atomiton.com");
    setPassword(localStorage.getItem("password") || "veolia@7799");
    setEntId(localStorage.getItem("entId") || "SNYGRUOXEROKAWX63HPMQC6ER3QWBPS4Z");
    setOrgId(localStorage.getItem("orgId") || "SYMDKFIM4KQLXSK6UYJZ4AE7PQQET35E2");
    setPlantId(localStorage.getItem("plantId") || "SYHI5OY7RAIGBBYOYVQOCOC7JMCNC4RPP");

    // Check if username and password are set
    console.log("Checking username and password...");
    if (username && password) {
      console.log("Checking user FID...");
      getUserFID();
    }

    // Check and set connection string
    // setConnectionString("fid-DBI-LOCAL");

  }, [host, selectedOption, username, password]);

  const delay = ms => new Promise(res => setTimeout(res, ms));

  function getUserFID() {
    // Send HTTP request to get UFID
    const bodyContent = {
      login: {
        email: username,
        password: password
      }
    };
    console.log("Request body:", bodyContent);

    fetch(`http://${host}/fid-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyContent)
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.login && data.login.fid) {
          console.log("Login Success:", JSON.stringify(data.login, null, 2));
          setUFID(data.login.fid);
          if (selectedOption === "fid-USER") {
            setConnectionString("fid-" + data.login.fid);
          }
        }
      })
      .catch(err => {
        console.error("Failed to fetch UFID:", err);
      });
  }

  function getOrgList() {

  }

  function importMonacoThemes() {
    const themeList = {
      "active4d": "Active4D.json",
      "all_hallows_eve": "All Hallows Eve.json",
      "amy": "Amy.json",
      "birds_of_paradise": "Birds of Paradise.json",
      "blackboard": "Blackboard.json",
      "brilliance_black": "Brilliance Black.json",
      "brilliance_dull": "Brilliance Dull.json",
      "chrome_devtools": "Chrome DevTools.json",
      "clouds_midnight": "Clouds Midnight.json",
      "clouds": "Clouds.json",
      "cobalt": "Cobalt.json",
      "cobalt2": "Cobalt2.json",
      "dawn": "Dawn.json",
      "dominion_day": "Dominion Day.json",
      "dracula": "Dracula.json",
      "dreamweaver": "Dreamweaver.json",
      "eiffel": "Eiffel.json",
      "espresso_libre": "Espresso Libre.json",
      "github": "GitHub.json",
      "github_dark": "GitHub Dark.json",
      "github_light": "GitHub Light.json",
      "idle": "IDLE.json",
      "katzenmilch": "Katzenmilch.json",
      "kuroir_theme": "Kuroir Theme.json",
      "lazy": "LAZY.json",
      "magicwb_amiga": "MagicWB (Amiga).json",
      "merbivore": "Merbivore.json",
      "merbivore_soft": "Merbivore Soft.json",
      "monokai": "Monokai.json",
      "monokai_bright": "Monokai Bright.json",
      "night_owl": "Night Owl.json",
      "nord": "Nord.json",
      "oceanic_next": "Oceanic Next.json",
      "pastels_on_dark": "Pastels on Dark.json",
      "slush_and_poppies": "Slush and Poppies.json",
      "solarized-dark": "Solarized-dark.json",
      "solarized-light": "Solarized-light.json",
      "spacecadet": "SpaceCadet.json",
      "sunburst": "Sunburst.json",
      "textmate_mac_classic": "Textmate (Mac Classic).json",
      "tomorrow": "Tomorrow.json",
      "tomorrow-night": "Tomorrow-Night.json",
      "tomorrow-night-blue": "Tomorrow-Night-Blue.json",
      "tomorrow-night-bright": "Tomorrow-Night-Bright.json",
      "tomorrow-night-eighties": "Tomorrow-Night-Eighties.json",
      "twilight": "Twilight.json",
      "upstream_sunburst": "Upstream Sunburst.json",
      "vibrant_ink": "Vibrant Ink.json",
      "xcode_default": "Xcode_default.json",
      "zenburnesque": "Zenburnesque.json",
      "iplastic": "iPlastic.json",
      "idlefingers": "idleFingers.json",
      "krtheme": "krTheme.json",
      "monoindustrial": "monoindustrial.json"
    }

    // Import all themes from themeList
    Object.entries(themeList).forEach(([themeName, fileName]) => {
      import(`monaco-themes/themes/${fileName}`)
        .then(data => {
          if (data) {
            window.monaco && window.monaco.editor.defineTheme(themeName, data);
          }
        })
        .catch(err => {
          console.warn(`Failed to load theme ${themeName}:`, err);
        });
    });
  }

  function setMonacoTheme(selectedTheme) {
    setTheme(selectedTheme);
    window.monaco && window.monaco.editor.setTheme(selectedTheme);
  }

  const updateStatus = (message) => {
    if (document.querySelector(".ide-message")) {
      document.querySelector(".ide-message").textContent = message;
    }
  }

  const handleSetOrg = async () => {
    // Read text from set_org_request.yaml (simulate fetch from public folder)
    let text = "";
    try {
      const response = await fetch("/set_org_request.yaml");
      if (!response.ok) throw new Error("Failed to load set_org_request.yaml");
      text = await response.text();
    } catch (err) {
      addMessage("Error loading set_org_request.yaml: " + err.message);
      updateStatus("Error loading set_org_request.yaml");
      return;
    }

    if (!isConnected || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addMessage("Not connected to WebSocket");
      console.error("Not connected to WebSocket");
      updateStatus("Error: Not connected to WebSocket");
      return;
    }

    try {
      wsRef.current.send(text);
      addMessage("Sent to WebSocket:", text);
      console.log("Sent to WebSocket:", text); // This line already logs the sent message
      updateStatus("Code sent successfully");
    } catch (error) {
      addMessage("Error sending message:", error);
      console.error("Error sending message:", error);
      updateStatus("Error sending code");
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Submitting code...", event);

    if (!isConnected || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addMessage("Not connected to WebSocket");
      console.error("Not connected to WebSocket");
      updateStatus("Error: Not connected to WebSocket");
      return;
    }

    const editorContent = editorRef.current.getValue();

    try {
      wsRef.current.send(editorContent);
      addMessage("Sent to WebSocket:", editorContent);
      console.log("Sent to WebSocket:", editorContent); // This line already logs the sent message
      updateStatus("Code sent successfully");
    } catch (error) {
      addMessage("Error sending message:", error);
      console.error("Error sending message:", error);
      updateStatus("Error sending code");
    }
  };

  const handleLoad = () => {
    setIsLoading(false); // Set loading to false when iframe loads successfully
  };

  const handleError = () => {
    setIsLoading(true); // Keep loading true or set an error state if the iframe fails to load
  };

  const handleHostChange = (e) => {
    const selected = e.target.value;
    setSelectedHost(selected);
    switch (selected) {
      case "LOCAL":
        setHost("localhost:8686");
        break;
      case "8686":
        setHost("veoliaint.atomiton.com:8686");
        break;
      case "8989":
        setHost("veoliaint.atomiton.com:8989");
        break;
      default:
        setHost("<ERROR>");
    }
  };

  const handleOptionChange = (e) => {
    const selected = e.target.value;
    setSelectedOption(selected);
    switch (selected) {
      case "fid-JOB":
        setConnectionString("fid-JOB-WS");
        break;
      case "fid-DBI":
        setConnectionString("fid-DBI-LOCAL");
        break;
      case "fid-DBA":
        setConnectionString("fid-" + orgId);
        break;
      case "fid-DBU":
        setConnectionString("fid-DBU-LOCAL");
        break;
      case "fid-USER":
        setConnectionString("fid-" + uFID);
        break;
      default:
        setConnectionString("<ERROR>");
    }
  };

  return (
    <div className="flex justify-center items-start h-screen bg-gray-100">
      <div className="w-full h-full p-5 flex flex-col">
        <div className="mb-4 flex items-center space-x-2">
          <button
            className="px-3 py-2 mr-2 text-white rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => {
              if (wsRef.current) {
                wsRef.current.close();
              }
              setIsConnected(false);
              console.log(`Disconnected from WebSocket: ${host + '/' + connectionString}`);
              window.location.href = "/settings";
            }}
          >⚙️</button>
          <select
            value={selectedHost}
            onChange={handleHostChange}
            className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 ${isConnected ? 'bg-gray-100' : 'bg-white'
              }`}
            style={{ minWidth: '100px' }}
            disabled={isConnected}
          >
            <option value="LOCAL">LOCAL</option>
            <option value="8686">QA-8686</option>
            <option value="8989">DEV-8989</option>
          </select>
          <select
            value={selectedOption}
            onChange={handleOptionChange}
            className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 ${isConnected ? 'bg-gray-100' : 'bg-white'
              }`}
            style={{ minWidth: '100px' }}
            disabled={isConnected}
          >
            <option value="none">None</option>
            <option value="fid-DBI">fid-DBI</option>
            <option value="fid-JOB">fid-JOB</option>
            <option value="fid-DBA">fid-DBA</option>
            <option value="fid-DBU">fid-DBU</option>
            <option value="fid-USER">fid-USER</option>
          </select>
          <div className="relative -ml-6 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Enter WebSocket URL"
            value={host + '/' + connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            className={`flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isConnected ? 'bg-gray-100' : 'bg-white'
              }`}
            disabled={isConnected}
          />
          <button
            onClick={handleConnect}
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isConnected ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {isConnected ? "Disconnect" : "Connect"}
          </button>
          {isConnected && (
            <button
              onClick={handleSetOrg}
              className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-indigo-600 hover:bg-indigo-700`}
            >SetOrg</button>
          )}
          <select
            value={theme}
            onChange={(e) => setMonacoTheme(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 bg-white"
            style={{ minWidth: '100px' }}
          >
            <option value="monokai">Monokai</option>
            <option value="github_dark">GitHub Dark</option>
            <option value="github_light">GitHub Light</option>
            <option value="dracula">Dracula</option>
            <option value="night_owl">Night Owl</option>
            <option value="solarized-dark">Solarized Dark</option>
            <option value="solarized-light">Solarized Light</option>
            <option value="dimTheme">Dim Theme</option>
          </select>
        </div>

        <div className="w-full flex-grow flex flex-col bg-gray-800 rounded-md">
          <form onSubmit={handleSubmit} className="flex flex-col h-full pt-5 pb-5">
            <div className="flex-grow overflow-hidden">
              <label htmlFor="comment" className="sr-only">
                Unload your sh*t here ...
              </label>
              <Editor
                height="100%"
                defaultLanguage="ruby"
                defaultValue={`#
var $mode = 'Veolia' 
# HWF / Veolia / Miche / Vitual
# 
var $BASE_VALUE:
  HWF:
    orgId: S4KYOK7PYZ6UE3VBMU42BFHTZIDHQF5M3
    enterpriseId: SLNSTXYEDPQ7B6TYYF7TFNRVBC2UAYJ4J
    plantId: SLJT5CQQKQQARRKMVN6AEIM4EOCMNDCBI
    plantName: HWF Full Demo

  Veolia:
    orgId: SYMDKFIM4KQLXSK6UYJZ4AE7PQQET35E2
    enterpriseId: SNYGRUOXEROKAWX63HPMQC6ER3QWBPS4Z
    plantId: SYHI5OY7RAIGBBYOYVQOCOC7JMCNC4RPP # SYHI5OY7RAIGBBYOYVQOCOC7JMCNC4RPP / S73PY4ENJICPNFG5ROHYCVIF6BS3NAZE4
    plantName: 'Chalon (automatic data)' # Chalon (automatic data) / Veolia Hoskote Plant

  Miche:
    orgId: SN33QCCTDWRAM4ZTBG5AWSPNHKXF4DQG6
    enterpriseId: SNAYCEV5IKEMOZJ2Q73OBPFHVMGC2C3XA
    plantId: SMB5FOEM4E5X6EZSJFAUMMHL6UWK6SNKF
    plantName: "US-7"

  Vitual:
    orgId: SAIDTFZEHRFDCNJY4YDUCZES7T2XSRSF6
    enterpriseId: S3JCWULWUGIMZN3LYHMLINRGWKXYSULAZ
    plantId: SZY2VZWCHEGKQGWVTLX5MSURU7KJALMTZ
    plantName: "CBRE, MSD, Carlow, Ireland"

$$.mlresult.AFI = valueof $F.AFI-LOCAL
$args.mid = 'm1'
$args.id = GetOrgs($args).Orgs.getFirst().id
$args.timeZone = 'Asia/Saigon'
$args.userId = 'SPSEUHF4M3BYKKYLZYCECSDWL2ZGRFRZ5'
SetOrg($args)
$$.mlresult.remove('SetOrg')
$$.mlresult.remove('GetOrgs')

$args.clearImp()
$args.mid = 'm1'
$args.enterpriseId = $BASE_VALUE.($mode).enterpriseId

$args.orgId = $BASE_VALUE.($mode).orgId
SetSelectedEnterprise($args)
$$.mlresult.remove('SetSelectedEnterprise')

$args.clearImp()
$args.mid = 'm1'
$args.plantId = $BASE_VALUE.($mode).plantId
$args.plantName = $BASE_VALUE.($mode).plantName
$args.enterpriseId = $BASE_VALUE.($mode).enterpriseId
SetPlantData($args)
$$.mlresult.remove('SetPlantData')

$$.mlresult.Status = 'Success'`}
                theme={theme}
                options={{
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: 'on'
                }}
                onMount={handleEditorDidMount}
              />
            </div>
            <div className="flex justify-between p-5">
              <div className="overflow-y-auto max-h-20">
                <p className="text-sm text-white">
                  {JSON.stringify(msgLog, null, 2)}
                </p>
              </div>
              <div className="pl-5">
                <button
                  type="submit"
                  className={`inline-flex items-center rounded-md px-5 py-5 text-md font-semibold text-white ${isConnected ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  disabled={!isConnected}
                >Send</button>
              </div>
            </div>
          </form>
        </div>
        {/* <div className="pt-5 pb-5 flex">
          <div className="overflow-y-auto max-h-20">
            <div className="overflow-y-auto max-h-20 pt-5 pl-5">
              <ul className="list-disc">
                {[...sentMessages].reverse().map((message, index) => (
                  <li key={index} className="text-sm text-gray-700">{message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
