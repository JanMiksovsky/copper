class window.NavigationBar extends Control

  inherited:
    content: [
      control: Link, content: "Home", href: "index.html"
    ,
      control: Link, content: "About Bio-Terrorists", linksToArea: "true", href: "about.html"
    ,
      control: Link, content: "Activity Your Area",linksToArea: "true",  href: "activity.html"
    ,
      control: Link, content: "Register", linksToArea: "true", href: "register.html"
    ,
      control: Link, content: "Agents", linksToArea: "true", href: "agent.html"
    ]