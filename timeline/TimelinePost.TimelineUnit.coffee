class window.TimelinePost extends TimelineUnit

  inherited:
    content: [
      html: "div", ref: "byline", class: "clearfix", content: [
        html: "<img src='resources/profilePhoto.jpg'/>", ref: "profilePhoto"
      ,
        html: "div", ref: "authorBlock", content: [
          control: Link, ref: "TimelinePost_author"
        ,
          html: "div", ref: "TimelinePost_date"
        ]
      ]
    ,
      html: "div", ref: "TimelinePost_content"
    ]

  author: Control.chain "$TimelinePost_author", "content"
  authorPage: Control.chain "$TimelinePost_author", "href"
  content: Control.chain "$TimelinePost_content", "content"
  date: Control.chain "$TimelinePost_date", "content"
