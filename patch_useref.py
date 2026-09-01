import re

with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';")

old_bell = """  const NotificationBell = () => (
    <div className="relative">"""
new_bell = """  const bellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NotificationBell = () => (
    <div className="relative" ref={bellRef}>"""
code = code.replace(old_bell, new_bell)

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)
print("Added useRef and click outside logic.")
