// src/components/shared/PhotoDetector.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRobot } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';

const PhotoDetector = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // load history
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('photoLocatorHistory') || '[]');
    setMessages(saved);
  }, []);
  // persist history
  useEffect(() => {
    localStorage.setItem('photoLocatorHistory', JSON.stringify(messages));
  }, [messages]);

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSend = async () => {
    if (!selectedFile) return;

    // 1) user image bubble
    setMessages(m => [...m, { type: 'userImage', imageUrl: previewUrl }]);
    // 2) user text bubble
    setMessages(m => [
      ...m,
      { type: 'userText', text: 'Can you please locate where this photo was taken?' }
    ]);
    // 3) bot typing indicator
    const botId = Date.now();
    setMessages(m => [...m, { type: 'botTyping', id: botId }]);

    const form = new FormData();
    form.append('image', selectedFile);
    try {
      const res = await axios.post('/api/photo-location', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const location = res.data.location;
      // replace typing with result
      setMessages(m =>
        m.map(msg =>
          msg.id === botId ? { type: 'botText', text: location } : msg
        )
      );
    } catch {
      setMessages(m =>
        m.map(msg =>
          msg.id === botId ? { type: 'botText', text: 'Error detecting location.' } : msg
        )
      );
    } finally {
      // clear selection & preview
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black bg-opacity-25">
      <div className="absolute top-0 right-0 w-full md:w-80 h-full bg-white shadow-xl flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        {/* Header */}
        <header className="px-4 py-3 border-b border-gray-200 flex justify-center items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <FaRobot className="text-gray-600" />
          </div>
          <h2 className="text-lg font-[be_vietnam_pro] text-gray-900">
            PictoPlace
          </h2>
        </header>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
          {messages.map((msg, i) => {
            if (msg.type === 'userImage') {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-xs p-1 bg-blue-100 text-gray-900 rounded-lg">
                    <img
                      src={msg.imageUrl}
                      alt="Upload"
                      className="rounded-md w-full"
                    />
                  </div>
                </div>
              );
            }
            if (msg.type === 'userText') {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-xs p-2 bg-blue-100 text-gray-900 rounded-lg">
                    {msg.text}
                  </div>
                </div>
              );
            }
            if (msg.type === 'botTyping') {
              return (
                <div key={i} className="flex justify-start items-center space-x-2">
                  <FaRobot className="text-2xl text-gray-500 animate-pulse" />
                  <div className="h-6 w-10 bg-gray-300 rounded-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-2 bg-gray-400 rounded-full animate-ping" />
                  </div>
                </div>
              );
            }
            if (msg.type === 'botText') {
              return (
                <div key={i} className="flex justify-start">
                  <div className="max-w-xs p-2 bg-gray-200 text-gray-900 rounded-lg flex items-center space-x-2">
                    <FaRobot className="text-xl text-gray-600" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white flex flex-col gap-2">
          {/* Preview */}
          {previewUrl && (
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-24 rounded-md border border-gray-300"
              />
            </div>
          )}

          {/* Upload & Send */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <label
                htmlFor="photo-upload"
                className="
                  block w-full text-center
                  bg-blue-600 hover:bg-blue-700
                  text-white font-medium
                  py-2 rounded-md
                  cursor-pointer
                  transition-colors duration-200
                "
              >
                Upload Photo
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!selectedFile}
              className="p-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              <IoMdSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetector;