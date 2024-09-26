"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { loader, useMonaco } from '@monaco-editor/react';
import "monaco-themes/themes/GitHub Dark.json";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function IDE() {
  const [connectionString, setConnectionString] = useState("");
  const [host, setHost] = useState("ws://veoliaint.atomiton.com:8989");
  const [orgID, setOrgID] = useState("S4KYOK7PYZ6UE3VBMU42BFHTZIDHQF5M3");
  const [uFID, setUFID] = useState("fqm2ib3g4ubgsupdu2iycpb2dj3ant5fq");
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const editorRef = useRef(null);
  const [URL, setURL] = useState("");
  const [project, setProject] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedHost, setSelectedHost] = useState("");
  const [msgLog, setMsgLog] = useState("");
  const [sentMessages, setSentMessages] = useState([]);

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
        wsRef.current = new WebSocket(host + '/' + connectionString);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          console.log(`Connected to WebSocket: ${host + '/' + connectionString}`);
        };

        wsRef.current.onmessage = (event) => {
          addMessage("Received message:", event.data);
          console.log("Received message:", event.data);
          try {
            const parsedData = JSON.parse(event.data);
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
    loader.init().then(monaco => {
      monaco.editor.defineTheme('dimTheme', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#f3f4f6', // This is a light gray color (Tailwind's gray-100)
        }
      });
      import('monaco-themes/themes/GitHub Dark.json')
        .then(data => { monaco.editor.defineTheme('monokai', data); })
        .then(_ => monaco.editor.setTheme('monokai'))
    });
  }, []);

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const updateStatus = (message) => {
    if (document.querySelector(".ide-message")) {
      document.querySelector(".ide-message").textContent = message;
    }
  }

  const handleSetOrg = () => {
    const text = `#
      var $mode = 'HWF'
      # 
      var $BASE_VALUE:
        HWF:
          orgId: S4KYOK7PYZ6UE3VBMU42BFHTZIDHQF5M3
          enterpriseId: SLNSTXYEDPQ7B6TYYF7TFNRVBC2UAYJ4J
          plantId: SLJT5CQQKQQARRKMVN6AEIM4EOCMNDCBI
          plantName: HWF Full Demo
        Veolia:
          orgId: SYMDKFIM4KQLXSK6UYJZ4AE7PQQET35E2
          enterpriseId: SNYGRUOXEROKAWX63HPMQC6ER3QWBaPS4Z
          plantId: S73PY4ENJICPNFG5ROHYCVIF6BS3NAZE4
          plantName: Veolia Hoskote Plant

      $$.mlresult.AFI = valueof $F.AFI-LOCAL
      $args.mid = 'm1'
      $args.id = GetOrgs($args).Orgs.getFirst().id
      $args.timeZone = 'Asia/Saigon'
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

      $$.mlresult.Status = 'Success'`;

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
        setHost("ws://localhost:8090");
        break;
      case "8686":
        setHost("ws://veoliaint.atomiton.com:8686");
        break;
      case "8989":
        setHost("ws://veoliaint.atomiton.com:8989");
        break;
      default:
        setHost("<ERROR>");
    }
  };

  const handleOptionChange = (e) => {
    const selected = e.target.value;
    setSelectedOption(selected);
    switch (selected) {
      case "fid-DBI":
        setConnectionString("fid-DBI-LOCAL");
        break;
      case "fid-DBA":
        setConnectionString("fid-" + orgID);
        break;
      case "fid-DBU":
        setConnectionString("fid-DBU-LOCAL");
        break;
      case "fix-USER":
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
          <select
            value={selectedHost}
            onChange={handleHostChange}
            className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 ${isConnected ? 'bg-gray-100' : 'bg-white'
              }`}
            style={{ minWidth: '100px' }}
            disabled={isConnected}
          >
            <option value="">HOST</option>
            <option value="LOCAL">LOCAL</option>
            <option value="8686">QA 86</option>
            <option value="8989">DEV 89</option>
          </select>
          <select
            value={selectedOption}
            onChange={handleOptionChange}
            className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 ${isConnected ? 'bg-gray-100' : 'bg-white'
              }`}
            style={{ minWidth: '100px' }}
            disabled={isConnected}
          >
            <option value="">WS</option>
            <option value="fid-DBI">fid-DBI</option>
            <option value="fid-DBA">fid-DBA</option>
            <option value="fid-DBU">fid-DBU</option>
            <option value="fix-USER">fix-USER</option>
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
            >
              SetOrg
            </button>
          )}
        </div>

        <div className="w-full flex-grow flex flex-col bg-gray-800 rounded-md">
          <form onSubmit={handleSubmit} className="flex flex-col h-full pt-5 pb-5">
            <div className="flex-grow overflow-hidden">
              <label htmlFor="comment" className="sr-only">
                Add your code
              </label>
              <Editor
                height="100%"
                defaultLanguage="python"
                defaultValue='#'
                theme="monokai"
                options={{
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: 'on'
                }}
                onMount={handleEditorDidMount}
              />
            </div>
          </form>
        </div>
        <div className="pt-5 pb-5 flex justify-between">
          <div className="overflow-y-auto max-h-20">
            <ul className="list-disc">
              {[...sentMessages].reverse().map((message, index) => (
                <li key={index} className="text-sm text-gray-700">{message}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`inline-flex items-center rounded-md px-5 py-5 text-md font-semibold text-white ${isConnected ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-400 cursor-not-allowed'
                }`}
              disabled={!isConnected}
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
