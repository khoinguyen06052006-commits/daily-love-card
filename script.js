/**
 * ==============================================================================
 * THIỆP ĐIỆN TỬ TÌNH YÊU - CLIENT JAVASCRIPT
 * Tự động đồng bộ nội dung kịch bản thiệp mỗi ngày từ Google Sheets (CSV)
 * ==============================================================================
 */

// 1. HẰNG SỐ CẤU HÌNH LINK CSV GOOGLE SHEETS LẤY NỘI DUNG THIỆP MỖI NGÀY
// Dán đường link xuất bản Google Sheets dạng CSV vào đây:
// (Ví dụ: "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv"
//  hoặc: "https://docs.google.com/spreadsheets/d/1fzesb7HrcuS7spJ88lpVKb-1PEIWvdPEwNlZm5lt1-8/gviz/tq?tqx=out:csv")
const CONTENT_SHEET_CSV_URL = "DÁN_LINK_CSV_VÀO_ĐÂY";

// 2. Link Web App Google Apps Script nhận phản hồi lời nhắn gửi về Google Sheet
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6wr8uSgQZFp7JDy8L8IiU9M-QYe4BzIru_PX7guJc9su7S6h-RolQvnng4ckVZ36K/exec";

/* ==============================================================================
   0. CẤU HÌNH TÍCH HỢP THỰC TẾ (GOOGLE APPS SCRIPT & GOOGLE SHEETS)
   ============================================================================== */
const INTEGRATION_CONFIG = {
  CONTENT_SHEET_CSV_URL: CONTENT_SHEET_CSV_URL,
  GOOGLE_SCRIPT_URL: GOOGLE_SCRIPT_URL,
  // Link Google Sheets dự phòng nếu CONTENT_SHEET_CSV_URL chưa được dán link mới
  BACKUP_SHEET_CSV_URL: ""
};

/* ==============================================================================
   1. DỮ LIỆU DỰ PHÒNG NỘI BỘ (FALLBACK DATA)
   Tự động kích hoạt khi chưa có Google Sheets hoặc mất mạng
   ============================================================================== */
const EMBEDDED_DATA = {
  config: {
    passcode: "0508",
    anniversaryDate: "2026-07-26",
    recipientName: "Em Bé Của Anh",
    senderName: "Người thương của em ❤️",
    musicUrl: "https://res.cloudinary.com/yowk0aay/video/upload/v1794639745/%C4%91%E1%BB%83_d%C3%A0nh_cho_em.mp3"
  },
  letters: [
    {
      date: "2026-11-14",
      letterNumber: "Bức thư tình #01",
      title: "Nắng Ấm Dịu Dàng Giữa Mùa Đông",
      imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
      caption: "Nụ cười của em là ánh mặt trời ấm áp nhất ☀️",
      message: [
        "Gửi em, mảnh ghép dịu dàng nhất của cuộc đời anh,",
        "Hôm nay trời có chút se se lạnh, em nhớ mặc áo ấm khi ra ngoài nhé. Sáng nay thức dậy, điều đầu tiên anh nghĩ đến chính là nụ cười của em.",
        "Gửi cho em những lời văn có vẻ hơi ngây ngô nhưng chứa đầy trân thành từ nơi anh. Tình yêu nơi em là sự ngọt ngào và ấm áp nhất mà anh được nhận.",
        "Đôi khi anh có vụng về khi đón nhận tình cảm ấy mong em hãy nhẹ nhàng nói cho anh hiểu điều em đang muốn nhé."
      ],
      question: {
        prompt: "Hôm nay em muốn cùng anh làm điều gì nhất nè?",
        options: [
          "Xem phim",
          "Chơi game nè",
          "Nghe anh kể chuyện",
          "Chỉ cần bên nhau là được 🥰"
        ]
      }
    },
    {
      date: "2026-11-15",
      letterNumber: "Bức thư tình #02",
      title: "Khoảnh Khắc Kỷ Niệm Cuối Tuần",
      imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
      caption: "Những giây phút bình yên khi có em cạnh bên 💕",
      message: [
        "Chào em yêu của anh,",
        "Cuối tuần trôi qua thật nhanh khi được ở cạnh em. Từng tiếng cười, từng ánh mắt của em đều khiến lòng anh thấy nhẹ nhõm và ấm áp vô cùng.",
        "Cảm ơn em vì đã luôn kiên nhẫn và đồng hành cùng anh qua những ngày bình dị. Chúc em một buổi tối thật ngon giấc và chuẩn bị tinh thần cho tuần mới thật rạng rỡ nhé!"
      ],
      question: {
        prompt: "Cuối tuần vừa rồi em thấy vui nhất lúc nào?",
        options: [
          "Lúc được anh đón đi chơi 🛵",
          "Lúc cùng nhau ăn món ngon 🍲",
          "Lúc ngồi trò chuyện tâm sự ✨",
          "Tất cả mọi lúc bên anh 🥰"
        ]
      }
    },
    {
      date: "2026-11-16",
      letterNumber: "Bức thư tình #03",
      title: "Hôm Nay: Đầu Tuần Rạng Rỡ & Bình Yên Cho Em",
      imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
      caption: "Mong ngày đầu tuần của em thật dịu êm và nhiều tiếng cười 🌿",
      message: [
        "Chào em bé nhỏ của anh,",
        "Một tuần mới lại bắt đầu rồi nè. Không biết sáng nay em thức dậy có thấy sảng khoái và tràn đầy năng lượng không?",
        "Anh biết đầu tuần thường có nhiều công việc và đôi khi làm em thấy áp lực một chút. Nhưng em đừng lo nhé, dù bận rộn đến đâu thì vẫn luôn có một người ở đây cổ vũ và nghĩ về em từng giây từng phút.",
        "Hôm nay nhớ ăn uống đầy đủ, uống nhiều nước ấm và giữ cho mình thật nhiều niềm vui nhéee. Nếu có lúc nào mệt mỏi, hãy nhớ anh luôn sẵn sàng ôm em thật chặt!",
        "Chúc em một ngày thật suôn sẻ, anh yêu em nhiều lắm!"
      ],
      question: {
        prompt: "Sáng nay thức dậy điều đầu tiên em nghĩ đến là gì nè?",
        options: [
          "Nghĩ đến anh đầu tiên á 💕",
          "Muốn ngủ nướng thêm 5 phút 😴",
          "Hôm nay mặc gì cho xinh ✨",
          "Thèm một cốc cà phê / trà sữa ☕"
        ]
      }
    },
    {
      date: "2026-11-17",
      letterNumber: "Bức thư tình #04",
      title: "Ngày Mai: Điều Ngọt Ngào Dành Riêng Cho Em",
      imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      caption: "Mỗi ngày trôi qua, anh lại thấy thương em nhiều hơn một chút 🌸",
      message: [
        "Bức thư này anh viết để dành riêng cho ngày mai của chúng mình...",
        "Em biết không, mỗi khi nghĩ về chặng đường đã qua cùng em, anh luôn thầm cảm ơn vì cuộc đời đã mang em đến bên anh một cách thật tình cờ nhưng lại vô cùng trọn vẹn.",
        "Ngày mai có thể vẫn là một ngày bình thường trôi qua giữa dòng đời hối hả, nhưng trong tim anh, ngày nào có em cũng đều là một ngày đặc biệt.",
        "Hẹn gặp lại em vào ngày mai với một nụ cười thật tươi nhé. Ngủ một giấc thật ngon và mơ về những điều hạnh phúc của hai đứa mình nha em!"
      ],
      question: {
        prompt: "Nếu ngày mai được ước một điều ước, em sẽ ước gì?",
        "options": [
          "Ước được anh dẫn đi ăn món ngon 🍲",
          "Ước chúng mình mãi bình yên bên nhau 💖",
          "Ước mọi mệt mỏi đều tan biến ✨",
          "Chỉ cần anh luôn yêu em là đủ 🥰"
        ]
      }
    },
    {
      date: "2026-11-18",
      letterNumber: "Bức thư tình #05",
      title: "Sài Gòn Trở Lạnh, Nhớ Mặc Ấm Em Nhé",
      imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
      caption: "Giữ ấm bản thân và cười thật tươi hôm nay nhé cô gái của anh 🌸",
      message: [
        "Gửi em bé của anh,",
        "Sáng nay Sài Gòn bỗng nhiên se se lạnh hơn mọi ngày, lúc vừa thức dậy anh liền nghĩ ngay đến em.",
        "Em nhớ mặc thêm áo khoác ấm khi ra ngoài nhé, đừng chủ quan mà để bị cảm lạnh đấy.",
        "Chúc em bé có một ngày làm việc thật nhiều năng lượng, mọi việc đều suôn sẻ và thuận lợi.",
        "Dù bận rộn đến đâu cũng hãy nhớ luôn có một người thương em rất nhiều đang chờ đón em về.",
        "Làm việc thật vui vẻ em nhé, yêu em nhiều lắm!"
      ],
      question: {
        prompt: "Hôm nay trời lành lạnh, tối nay em muốn cùng anh làm gì?",
        options: [
          "Đi ăn một món nóng hổi ấm bụng với anh 🍲",
          "Cùng anh đi dạo ngắm phố phường se lạnh 🛵",
          "Uống một ly trà sữa ấm áp 🧋",
          "Về sớm cuộn chăn ấm xem phim cùng anh 🎬"
        ]
      }
    },
    {
      date: "2026-11-19",
      letterNumber: "Bức thư tình #06",
      title: "Một Ngày Bình Yên Và Luôn Có Anh Bên Cạnh",
      imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
      caption: "Chỉ cần có em, ngày bình thường cũng hóa dịu dàng ✨",
      message: [
        "Gửi em bé thương yêu của anh,",
        "Một ngày nữa lại trôi qua và anh lại có thêm một ngày được nhớ về em nhiều hơn hôm qua.",
        "Hôm nay của em thế nào rồi? Có điều gì làm em thấy vui hay có khoảnh khắc nào làm em thấy mỏi mệt một chút không?",
        "Anh chỉ mong mỗi khi em cảm thấy áp lực hay mệt nhoài ngoài kia, em sẽ nhớ rằng luôn có một vòng tay ấm áp của anh đang chờ để ôm em thật chặt.",
        "Tối nay em nhớ ăn uống đầy đủ, tắm nước ấm và nghỉ ngơi sớm nhé. Đừng quên là có một người thương em rất rất nhiều đấy!",
        "Chúc em bé của anh ngủ thật ngon và có những giấc mơ ngọt ngào nha ❤️"
      ],
      question: {
        prompt: "Hôm nay điều gì làm em bé thấy vui vẻ nhất nè?",
        options: [
          "Nhận được bức thư tình này của anh 🥰",
          "Công việc hôm nay trôi qua êm đẹp ✨",
          "Được nghe giọng nói của anh 📞",
          "Nghĩ đến lúc được gặp anh cuối tuần 💕"
        ]
      }
    },
    {
      date: "2026-11-20",
      letterNumber: "Bức thư tình #07",
      title: "Thứ Sáu Rồi, Em Đã Vất Vả Suốt Tuần Qua Rồi 🌸",
      imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
      caption: "Cuối tuần chạm ngõ, hãy để anh sưởi ấm cho em nhé 💕",
      message: [
        "Gửi em bé thương yêu của anh,",
        "Cuối cùng thì ngày thứ Sáu cũng đã đến rồi! Một tuần làm việc chăm chỉ của em chuẩn bị khép lại rồi đấy.",
        "Anh biết trong tuần có những lúc em mệt mỏi và áp lực, nhưng em đã làm rất tốt rồi, cô gái nhỏ của anh giỏi lắm.",
        "Tối nay xong việc em hãy thở phào một cái thật nhẹ nhõm nhé. Mọi âu lo cứ để lại phía sau, cuối tuần này anh sẽ bù đắp và chăm sóc em thật chu đáo.",
        "Yêu em nhiều lắm, tan làm anh đón em bé nhé!"
      ],
      question: {
        prompt: "Tối thứ Sáu thảnh thơi, em muốn chúng mình làm gì đầu tiên?",
        options: [
          "Đi ăn một bữa thật ngon xả stress 🍲",
          "Lên xe để anh chở đi hóng gió phố đêm 🛵",
          "Về nhà nằm nghỉ ngơi và nghe anh thủ thỉ 🛏️",
          "Đi dạo mua sắm hoặc uống trà sữa 🧋"
        ]
      }
    },
    {
      date: "2026-11-21",
      letterNumber: "Bức thư tình #08",
      title: "Thứ Bảy Bình Yên: Được Ngắm Em Cười Cả Ngày",
      imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
      caption: "Chỉ cần được ở bên em, khoảnh khắc nào cũng hóa ngọt ngào ✨",
      message: [
        "Chào buổi sáng cô công chúa của anh,",
        "Thứ Bảy không có chuông báo thức giục giã, mong em bé của anh có một giấc ngủ thật đã và thức dậy với nụ cười rạng rỡ.",
        "Những ngày bận rộn trôi qua, thứ anh mong mỏi nhất chính là những phút giây thảnh thơi được ngồi cạnh em, nắm tay em và ngắm nhìn em cười.",
        "Em chẳng cần phải vội vã làm bất cứ điều gì hôm nay đâu. Hôm nay hãy cứ tận hưởng sự nuông chiều của anh và làm những điều em yêu thích nhé.",
        "Hạnh phúc của anh đơn giản chỉ là được nhìn thấy em vui vẻ mỗi ngày!"
      ],
      question: {
        prompt: "Hôm nay em muốn được anh cưng chiều như thế nào nè?",
        options: [
          "Mua cho em món đồ ăn/nước uống em thích 🍰",
          "Được anh ôm thật chặt không buông 🥺",
          "Cùng anh chụp thật nhiều ảnh xinh 📸",
          "Ở bên anh cả ngày là em vui rồi 🥰"
        ]
      }
    },
    {
      date: "2026-11-22",
      letterNumber: "Bức thư tình #09",
      title: "Chủ Nhật Êm Đềm: Nạp Đầy Yêu Thương Cho Em",
      imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      caption: "Bình yên nhất là khi biết luôn có một người thương mình vô điều kiện 🌿",
      message: [
        "Gửi em, điều ngọt ngào nhất của anh,",
        "Chủ Nhật trôi qua êm ả như một bản nhạc dịu dàng. Nhìn lại những khoảnh khắc cuối tuần bên em, lòng anh lúc nào cũng thấy ấm áp vô cùng.",
        "Ngày mai là bắt đầu một tuần mới rồi, có thể sẽ lại có những guồng quay công việc bận rộn đón chờ. Nhưng em đừng lo lắng gì cả nhé, vì lúc nào anh cũng là hậu phương vững chắc nhất của em.",
        "Tối nay em nhớ ngâm chân nước ấm, dưỡng da xinh đẹp và đi ngủ thật sớm nhé.",
        "Anh sẽ luôn ở đây, yêu thương và bảo bọc em bé của anh mỗi ngày. Chúc em ngủ thật ngon!"
      ],
      question: {
        prompt: "Trước khi khép lại cuối tuần, em có điều gì muốn nhắn nhủ với anh không?",
        options: [
          "Cuối tuần bên anh vui và ấm áp lắm 💕",
          "Tuần mới anh cũng phải giữ sức khỏe nhé 🧣",
          "Mong tuần sau lại được gặp anh sớm ✨",
          "Yêu anh nhiều hơn hôm qua một chút nữa 🥰"
        ]
      }
    },
    {
      date: "2026-11-23",
      letterNumber: "Bức thư tình #10",
      title: "Hôm Nay: Tuần Mới Rạng Rỡ & Tràn Ngập Nụ Cười Nhé Em",
      imageUrl: "https://images.unsplash.com/photo-1513279922550-250c2129b13a?auto=format&fit=crop&w=800&q=80",
      caption: "Mỗi sớm mai thức dậy, người đầu tiên anh nghĩ đến luôn là em ☀️",
      message: [
        "Gửi em bé nhỏ của anh,",
        "Một tuần mới lại bắt đầu rồi nè! Sáng nay em thức dậy có thấy sảng khoái và tràn đầy năng lượng không?",
        "Anh gửi vào bức thư này một cái ôm thật ấm và ngàn nụ hôn ngọt ngào để tiếp thêm động lực cho em bắt đầu ngày đầu tuần thật suôn sẻ nhé.",
        "Dù công việc có bận đến đâu, em cũng nhớ uống nhiều nước, ăn trưa đúng giờ và đừng để mình bị căng thẳng quá nha.",
        "Bất cứ khi nào mệt mỏi, hãy mở thư anh ra đọc để biết rằng anh đang nhớ em nhiều thế nào. Chúc cô bé của anh một ngày đầu tuần thật rực rỡ và may mắn!"
      ],
      question: {
        prompt: "Hôm nay em muốn nhận 'liều thuốc tinh thần' nào từ anh nhất?",
        options: [
          "Một tin nhắn chúc ngày mới siêu ngọt ngào 💌",
          "Một cốc trà sữa được ship tận nơi 🧋",
          "Một cái ôm siết chặt thật ấm áp 🤗",
          "Chỉ cần anh luôn yêu thương và cưng chiều em 💕"
        ]
      }
    },
    {
      date: "2026-11-24",
      letterNumber: "Bức thư tình #11",
      title: "Đêm Muộn Bình Yên: Ngủ Thật Ngon Nha Em Bé Của Anh 🌙",
      imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
      caption: "Dù ngày dài có mệt mỏi đến đâu, đêm về vẫn luôn có anh yêu em ✨",
      message: [
        "Gửi em bé thương yêu của anh,",
        "Một ngày thứ Ba bận rộn nữa lại vừa trôi qua rồi. Lúc anh viết những dòng này cho em thì trời cũng đã về khuya, không biết em bé đã chuẩn bị đi ngủ chưa nhỉ?",
        "Anh biết hôm nay em cũng đã nỗ lực và cố gắng rất nhiều rồi. Hãy gác lại hết những âu lo, mỏi mệt ngoài kia nhé, vì em đã làm rất tuyệt vời.",
        "Đêm nay trời có chút se se lạnh, em nhớ kéo chăn đắp thật ấm và đừng nằm nghiêng một tư thế lâu nha.",
        "Ngủ một giấc thật sâu, mơ về những điều hạnh phúc và ngọt ngào nhất em nhé. Trong giấc mơ của anh lúc nào cũng có nụ cười của em đấy. Yêu và nhớ em rất nhiều! ❤️"
      ],
      question: {
        prompt: "Trước khi chìm vào giấc ngủ, em bé muốn anh làm điều gì nè?",
        options: [
          "Thì thầm chúc em ngủ ngon bên tai 🎧",
          "Kể cho em nghe một câu chuyện cổ tích 📖",
          "Ôm em thật chặt và vỗ về em ngủ 🧸",
          "Hôn lên trán em một cái thật dịu dàng 💋"
        ]
      }
    }
  ],
  fallbackLetter: {
    letterNumber: "Bức thư tình đặc biệt",
    title: "Bức Thư Tình Gửi Người Anh Thương",
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
    caption: "Mỗi ngày trôi qua đều là một ngày yêu em 💖",
    message: [
      "Gửi em bé đáng yêu của anh,",
      "Hôm nay anh chưa kịp cập nhật bức thư mới vào trang nhật ký, nhưng tình cảm anh dành cho em thì chưa bao giờ vơi bớt cả.",
      "Cảm ơn em đã luôn là nguồn năng lượng tích cực và dịu dàng nhất của anh. Hãy nhớ uống nhiều nước, ăn uống đúng giờ và giữ nụ cười thật tươi trên môi nhé!",
      "Anh yêu em nhiều hơn ngày hôm qua và ít hơn ngày mai một chút!"
    ],
    question: {
      prompt: "Hôm nay em có nhớ anh nhiều không?",
      options: [
        "Rất rất nhiều! 💕",
        "Nhiều hơn cả hôm qua 🥰",
        "Nhớ cả ngày lẫn đêm 🌙",
        "Không thể đếm xuể ✨"
      ]
    }
  }
};

/* ==============================================================================
   2. BIẾN TOÀN CỤC & QUẢN LÝ TRẠNG THÁI (APP STATE)
   ============================================================================== */
let appData = EMBEDDED_DATA;
let activeLetter = null;
let todayDateString = "";

const state = {
  currentPin: "",
  isUnlocked: false,
  isEnvelopeOpen: false,
  isLetterRevealed: false,
  isAudioPlaying: false,
  hugCount: 0,
  isTypingDone: false,
  typingTimeout: null,
  audioContext: null
};

/* ==============================================================================
   3. DOM ELEMENTS
   ============================================================================== */
const DOM = {
  // Screens
  lockScreen: document.getElementById("lock-screen"),
  envelopeScreen: document.getElementById("envelope-screen"),
  letterScreen: document.getElementById("letter-screen"),
  
  // Navigation
  archiveToggleBtn: document.getElementById("archive-toggle-btn"),
  openArchiveFromFooterBtn: document.getElementById("open-archive-from-footer-btn"),
  musicToggleBtn: document.getElementById("music-toggle-btn"),
  bgAudio: document.getElementById("bg-audio"),
  ambientCanvas: document.getElementById("ambient-canvas"),

  // Lock screen
  pinDots: document.querySelectorAll(".pin-dot"),
  pinMessage: document.getElementById("pin-message"),
  numpad: document.getElementById("numpad"),
  backspaceBtn: document.getElementById("backspace-btn"),
  hintBtn: document.getElementById("hint-btn"),
  passcodeHint: document.getElementById("passcode-hint"),

  // Envelope
  envelope: document.getElementById("envelope"),
  waxSeal: document.getElementById("wax-seal"),
  tapSealHint: document.getElementById("tap-seal-hint"),
  peekText: document.getElementById("peek-text"),

  // Letter elements
  vintageLetter: document.getElementById("vintage-letter"),
  letterNumber: document.getElementById("letter-number"),
  letterDate: document.getElementById("letter-date"),
  loveDaysCount: document.getElementById("love-days-count"),
  loveTimeDetail: document.getElementById("love-time-detail"),
  polaroidImg: document.getElementById("polaroid-image"),
  polaroidCaption: document.getElementById("polaroid-caption"),
  letterSalutation: document.getElementById("letter-salutation"),
  typewriterContent: document.getElementById("typewriter-content"),
  typewriterCursor: document.getElementById("typewriter-cursor"),
  skipTypingBtn: document.getElementById("skip-typing-btn"),
  signatureName: document.getElementById("signature-name"),

  // Daily Question elements
  dailyQuestionBox: document.getElementById("daily-question-box"),
  questionPrompt: document.getElementById("question-prompt"),
  questionOptions: document.getElementById("question-options"),
  questionFeedback: document.getElementById("question-feedback"),

  // Telegram & Google Sheets Reply elements
  wishSelectionBox: document.getElementById("wish-selection-box"),
  wishTagsGrid: document.getElementById("wish-tags-grid"),
  wishOtherToggle: document.getElementById("wish-other-toggle"),
  wishCustomContainer: document.getElementById("wish-custom-container"),
  wishCustomInput: document.getElementById("wish-custom-input"),
  replyTextInput: document.getElementById("reply-text-input"),
  replyCharCounter: document.getElementById("reply-char-counter"),
  sendReplyBtn: document.getElementById("send-reply-btn"),
  sendIcon: document.getElementById("send-icon"),
  sendText: document.getElementById("send-text"),
  replyStatus: document.getElementById("reply-status"),

  // Footer & Hug elements
  sendHugBtn: document.getElementById("send-hug-btn"),
  hugCounter: document.getElementById("hug-counter"),
  hugFeedback: document.getElementById("hug-feedback"),
  rewatchBtn: document.getElementById("rewatch-btn"),
  heartsContainer: document.getElementById("hearts-container"),

  // Archive Modal elements
  archiveModal: document.getElementById("archive-modal"),
  archiveBackdrop: document.getElementById("archive-backdrop"),
  closeArchiveBtn: document.getElementById("close-archive-btn"),
  archiveTodayText: document.getElementById("archive-today-text"),
  archiveCardsList: document.getElementById("archive-cards-list"),

  // Toast
  toastNotification: document.getElementById("toast-notification"),
  toastMessage: document.getElementById("toast-message"),
  toastIcon: document.getElementById("toast-icon")
};

/* ==============================================================================
   4. KHỞI TẠO ỨNG DỤNG (INITIALIZATION)
   ============================================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  // Lấy ngày hôm nay theo hệ thống máy (Định dạng YYYY-MM-DD)
  todayDateString = getTodayFormatted();
  DOM.archiveTodayText.textContent = formatDateToVietnamese(todayDateString);

  // Tải dữ liệu (Ưu tiên Google Sheets -> data.json -> Embedded Data)
  await loadData();

  // Tìm bức thư của ngày hôm nay
  selectLetterForToday();

  // Khởi tạo các thành phần giao diện & sự kiện
  setupEventListeners();
  initAmbientPetals();
  calculateDaysInLove();
  registerServiceWorker();
});

function getTodayFormatted(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateToVietnamese(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dayName = daysOfWeek[d.getDay()];
  
  return `${dayName}, ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
}

/* ==============================================================================
   5. BỘ PHÂN TÍCH CSV & TẢI DỮ LIỆU TỪ GOOGLE SHEETS
   ============================================================================== */

/**
 * Trình phân tích CSV thuần (Xử lý dấu ngoặc kép, dấu phẩy trong văn bản, xuống dòng)
 */
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // Bỏ qua dấu nháy kép thoát
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentCell.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Chuẩn hóa định dạng ngày từ Google Sheets (hỗ trợ cả YYYY-MM-DD và DD/MM/YYYY)
 */
function normalizeDate(rawDate) {
  if (!rawDate) return "";
  rawDate = rawDate.trim();
  // Nếu là DD/MM/YYYY -> đổi thành YYYY-MM-DD
  if (rawDate.includes("/")) {
    const p = rawDate.split("/");
    if (p.length === 3) {
      const day = p[0].padStart(2, "0");
      const month = p[1].padStart(2, "0");
      const year = p[2].length === 2 ? "20" + p[2] : p[2];
      return `${year}-${month}-${day}`;
    }
  }
  return rawDate;
}

/**
 * Chuẩn hóa link Google Sheets thành link tải CSV công khai
 * Hỗ trợ cả link /pub?output=csv, link /edit và link /gviz/tq
 */
function formatGoogleSheetCsvUrl(url) {
  if (!url) return "";
  url = url.trim();

  // Nếu người dùng dán link chỉnh sửa thông thường (edit link)
  if (url.includes("docs.google.com/spreadsheets") && url.includes("/edit")) {
    const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch && idMatch[1]) {
      const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
      const gid = gidMatch ? `&gid=${gidMatch[1]}` : "";
      return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/gviz/tq?tqx=out:csv${gid}`;
    }
  }

  return url;
}

/**
 * Tải và phân tích dữ liệu kịch bản thiệp từ Google Sheets CSV
 * Phân tích chuẩn xác các cột: Date, LetterNumber, Title, ImageURL, Message
 */
async function fetchGoogleSheetsLetters(csvUrl) {
  try {
    const formattedUrl = formatGoogleSheetCsvUrl(csvUrl);
    const res = await fetch(formattedUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) return null;

    // Phân tích tiêu đề các cột (Dòng 1 trong file Sheet)
    const rawHeaders = rows[0];
    const cleanHeaders = rawHeaders.map(h => 
      h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")
    );

    const dateIdx = cleanHeaders.findIndex(h => h.includes("date") || h.includes("ngay"));
    const numberIdx = cleanHeaders.findIndex(h => h.includes("letternumber") || h.includes("sothu") || h.includes("stt") || h.includes("number"));
    const titleIdx = cleanHeaders.findIndex(h => h.includes("title") || h.includes("tieude") || h.includes("chude"));
    const imgIdx = cleanHeaders.findIndex(h => h.includes("imageurl") || h.includes("image") || h.includes("img") || h.includes("anh") || h.includes("photo"));
    const msgIdx = cleanHeaders.findIndex(h => h.includes("message") || h.includes("noidung") || h.includes("thu") || h.includes("loinhan"));
    const captionIdx = cleanHeaders.findIndex(h => h.includes("caption") || h.includes("chuthich"));
    const questionIdx = cleanHeaders.findIndex(h => h.includes("question") || h.includes("cauhoi"));

    // Xác định chỉ số cột (nếu tiêu đề cột không khớp từ khóa thì dùng thứ tự cột mặc định)
    if (dateIdx === -1) return null;
    const finalDateIdx = dateIdx;
    const finalNumberIdx = numberIdx !== -1 ? numberIdx : (rows[0].length > 1 ? 1 : -1);
    const finalTitleIdx = titleIdx !== -1 ? titleIdx : (rows[0].length > 2 ? 2 : -1);
    const finalImgIdx = imgIdx !== -1 ? imgIdx : (rows[0].length > 3 ? 3 : -1);
    const finalMsgIdx = msgIdx !== -1 ? msgIdx : (rows[0].length > 4 ? 4 : -1);

    const letters = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawDate = finalDateIdx !== -1 ? row[finalDateIdx] : "";
      const date = normalizeDate(rawDate);
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

      const letterNumber = finalNumberIdx !== -1 && row[finalNumberIdx] ? row[finalNumberIdx] : `Bức thư #${i}`;
      const title = finalTitleIdx !== -1 && row[finalTitleIdx] ? row[finalTitleIdx] : "Thư Tình Gửi Em";
      const imageUrl = finalImgIdx !== -1 && row[finalImgIdx] ? row[finalImgIdx] : "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80";
      const rawMessage = finalMsgIdx !== -1 && row[finalMsgIdx] ? row[finalMsgIdx] : "Thương gửi em yêu...";

      // Tách các đoạn văn theo dấu xuống dòng
      const message = rawMessage.split(/\r?\n/).map(p => p.trim()).filter(p => p.length > 0);
      const caption = captionIdx !== -1 && row[captionIdx] ? row[captionIdx] : "Mỗi khoảnh khắc đều có em ✨";

      let question = null;
      if (questionIdx !== -1 && row[questionIdx]) {
        question = {
          prompt: row[questionIdx],
          options: ["Đồng ý luôn nè! 💕", "Thích lắm cơ 🥰", "Chỉ cần bên anh ✨", "Hết nước chấm 💖"]
        };
      }

      letters.push({
        date,
        letterNumber,
        title,
        imageUrl,
        caption,
        message,
        question
      });
    }

    return letters.length > 0 ? letters : null;
  } catch (err) {
    console.error("Lỗi khi tải từ Google Sheets CSV:", err);
    return null;
  }
}

/**
 * Tải toàn bộ dữ liệu ứng dụng:
 * 1. Nạp data.json làm nền tảng dự phòng
 * 2. Tự động fetch dữ liệu kịch bản từ link Google Sheets CSV (CONTENT_SHEET_CSV_URL)
 */
async function loadData() {
  // Bước 1: Nạp file data.json làm nền tảng
  try {
    const response = await fetch("data.json", { cache: "no-store" });
    if (response.ok) {
      const json = await response.json();
      appData = {
        config: { ...EMBEDDED_DATA.config, ...(json.config || {}) },
        letters: (json.letters && json.letters.length > 0) ? json.letters : EMBEDDED_DATA.letters,
        fallbackLetter: json.fallbackLetter || EMBEDDED_DATA.fallbackLetter
      };
      console.log("✅ Đã tải dữ liệu nền từ data.json");
    } else {
      appData = EMBEDDED_DATA;
    }
  } catch (err) {
    appData = EMBEDDED_DATA;
  }

  // Bước 2: Tự động lấy nội dung kịch bản thiệp mỗi ngày từ Google Sheets CSV
  // Ưu tiên: CONTENT_SHEET_CSV_URL -> BACKUP_SHEET_CSV_URL
  let csvUrlToFetch = null;
  if (typeof CONTENT_SHEET_CSV_URL === "string" && CONTENT_SHEET_CSV_URL.trim() !== "" && CONTENT_SHEET_CSV_URL !== "DÁN_LINK_CSV_VÀO_ĐÂY") {
    csvUrlToFetch = CONTENT_SHEET_CSV_URL.trim();
  } else if (INTEGRATION_CONFIG.BACKUP_SHEET_CSV_URL) {
    csvUrlToFetch = INTEGRATION_CONFIG.BACKUP_SHEET_CSV_URL;
  }

  if (csvUrlToFetch) {
    console.log("📊 Đang đồng bộ kịch bản thiệp từ Google Sheets CSV...");
    const sheetLetters = await fetchGoogleSheetsLetters(csvUrlToFetch);
    if (sheetLetters && sheetLetters.length > 0) {
      appData.letters = sheetLetters;
      console.log(`🎉 Đã nạp thành công ${sheetLetters.length} bức thư từ Google Sheets!`);
      showToast("Đã cập nhật thư mới từ Google Sheets! 📊✨", "💌");
    } else {
      console.warn("⚠️ Chưa thể kết nối Google Sheets hoặc bảng trống, sử dụng dữ liệu dự phòng");
    }
  }
}

/**
 * Chọn bức thư của ngày hôm nay:
 * 1. Tự động đối chiếu với ngày hiện tại của hệ thống (YYYY-MM-DD)
 * 2. Nếu ngày hôm nay chưa có dòng dữ liệu mới trên Sheet, hiển thị lời nhắn mặc định dễ thương
 */
function selectLetterForToday() {
  const letters = appData.letters || [];
  
  // 1. Tự động đối chiếu với ngày hiện tại của hệ thống (YYYY-MM-DD)
  let match = letters.find(l => l.date === todayDateString);

  if (match) {
    activeLetter = match;
  } else {
    // 2. Nếu ngày hôm nay chưa có dòng dữ liệu mới trên Sheet, hiển thị lời nhắn mặc định dễ thương
    activeLetter = {
      date: todayDateString,
      letterNumber: "Bức thư tình hôm nay",
      title: "Hôm nay anh đang chuẩn bị một điều bất ngờ cho em...",
      imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
      caption: "Mỗi ngày trôi qua đều là một ngày yêu em 💖",
      message: [
        "Gửi em bé đáng yêu của anh,",
        "Hôm nay anh đang chuẩn bị một điều bất ngờ nho nhỏ dành riêng cho em...",
        "Dù trang nhật ký hôm nay chưa kịp cập nhật câu chuyện mới, nhưng tình cảm và nỗi nhớ anh dành cho em thì chưa từng vơi bớt một giây phút nào.",
        "Em nhớ ăn uống đầy đủ, uống nhiều nước ấm và giữ nụ cười thật tươi nhé. Chờ anh một chút nhé, điều ngọt ngào sắp đến rồi! 💕"
      ],
      question: {
        prompt: "Em có tò mò bất ngờ hôm nay của anh là gì không nè?",
        options: [
          "Tò mò lắm luôn á! 🥰",
          "Đang háo hức chờ nè 💖",
          "Chỉ cần là anh thì gì em cũng thích ✨",
          "Bật mí trước xíu đi mà 🥺"
        ]
      }
    };
  }

  renderCurrentLetter();
}

/**
 * Render dữ liệu bức thư đang chọn vào HTML
 */
function renderCurrentLetter() {
  if (!activeLetter) return;

  DOM.letterNumber.textContent = activeLetter.letterNumber || "Bức thư tình";
  DOM.letterDate.textContent = formatDateToVietnamese(activeLetter.date || todayDateString);
  DOM.polaroidImg.onerror = () => {
    DOM.polaroidImg.src = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80";
  };
  DOM.polaroidImg.src = activeLetter.imageUrl || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80";
  DOM.polaroidCaption.textContent = activeLetter.caption || "Bình yên bên em ✨";
  DOM.letterSalutation.textContent = activeLetter.title || `Gửi ${appData.config.recipientName || "Em"}`;
  DOM.signatureName.textContent = appData.config.senderName || "Người thương của em ❤️";
  DOM.peekText.textContent = `Thư gửi: ${activeLetter.date}`;

  renderDailyQuestion(activeLetter.question);
}

function renderDailyQuestion(questionObj) {
  if (!questionObj || !questionObj.prompt) {
    DOM.dailyQuestionBox.style.display = "none";
    return;
  }

  DOM.dailyQuestionBox.style.display = "block";
  DOM.questionPrompt.textContent = questionObj.prompt;
  DOM.questionFeedback.textContent = "";
  DOM.questionOptions.innerHTML = "";

  (questionObj.options || []).forEach(optText => {
    const btn = document.createElement("button");
    btn.className = "question-opt-btn";
    btn.innerHTML = `<span>${optText}</span><span class="opt-check">🤍</span>`;

    btn.addEventListener("click", () => {
      DOM.questionOptions.querySelectorAll(".question-opt-btn").forEach(b => {
        b.classList.remove("selected");
        const check = b.querySelector(".opt-check");
        if (check) check.textContent = "🤍";
      });

      btn.classList.add("selected");
      const currentCheck = btn.querySelector(".opt-check");
      if (currentCheck) currentCheck.textContent = "💖";

      DOM.questionFeedback.textContent = "Anh đã ghi nhớ câu trả lời đáng yêu của em rồi nhé! 🥰";
      playHeartPopSound();
      spawnHeartsExplosion(12);

      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    });

    DOM.questionOptions.appendChild(btn);
  });
}

/* ==============================================================================
   6. HỘP THƯ PHẢN HỒI NHANH VỀ TELEGRAM BOT
   ============================================================================== */

/**
 * Mã hóa ký tự HTML an toàn trước khi gửi đến Telegram (tránh lỗi parse_mode HTML)
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Thu thập các lựa chọn trong khung "Điều em muốn làm nhất hôm nay"
 */
function getSelectedWishes() {
  const selectedTags = Array.from(document.querySelectorAll(".wish-tag-btn.selected"));
  if (selectedTags.length === 0) {
    return "Không chọn";
  }

  const wishes = [];
  selectedTags.forEach(btn => {
    const wishVal = btn.dataset.wish;
    if (wishVal === "Khác") {
      const customVal = DOM.wishCustomInput ? DOM.wishCustomInput.value.trim() : "";
      if (customVal) {
        wishes.push(`Khác: ${customVal}`);
      } else {
        wishes.push("Khác");
      }
    } else if (wishVal) {
      wishes.push(wishVal);
    }
  });

  return wishes.length > 0 ? wishes.join(", ") : "Không chọn";
}

/**
 * Gửi tin nhắn phản hồi về Telegram Bot API (Kèm số lượt ôm & điều muốn làm)
 */
async function sendTelegramMessage(text, hugCount = 0, todayWish = "Không chọn") {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = INTEGRATION_CONFIG;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || TELEGRAM_BOT_TOKEN.trim() === "" || TELEGRAM_CHAT_ID.trim() === "") {
    return {
      success: false,
      isConfigMissing: true,
      message: "Chưa cấu hình Telegram Bot"
    };
  }

  const letterDate = activeLetter ? activeLetter.date : todayDateString;
  const letterTitle = activeLetter ? activeLetter.title : "Thiệp Tình Yêu";
  const now = new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const formattedText = 
    `💌 <b>CÓ LỜI NHẮN MỚI TỪ NGƯỜI THƯƠNG!</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📅 <b>Thư ngày:</b> ${letterDate} (<i>${escapeHTML(letterTitle)}</i>)\n` +
    `⏰ <b>Thời gian gửi:</b> ${now}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🤗 <b>Lượt gửi ôm:</b> ${hugCount} cái ôm\n` +
    `✨ <b>Điều muốn làm:</b> ${escapeHTML(todayWish)}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💬 <b>Lời nhắn của em:</b>\n` +
    `<i>"${escapeHTML(text)}"</i>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💖 <i>(Gửi tự động từ website Thiệp Tình Yêu)</i>`;

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedText,
        parse_mode: "HTML"
      })
    });

    const result = await response.json();
    return { success: result.ok };
  } catch (err) {
    return { success: false };
  }
}

/**
 * Xử lý sự kiện bấm nút gửi phản hồi vào Google Sheets qua Apps Script
 * Đóng gói đủ 4 trường: cardDate, message, hugCount, todayWish
 */
async function handleSendReply() {
  const replyInput = DOM.replyTextInput;
  const statusElem = DOM.replyStatus;
  const message = replyInput.value.trim();

  // Kiểm tra nội dung rỗng
  if (!message) {
    statusElem.className = "reply-status warning";
    statusElem.textContent = "Em ơi, hãy viết vài dòng nhắn gửi trước khi bấm gửi nhé! 💕";
    replyInput.focus();
    return;
  }

  // Thu thập 4 thông số:
  // 1. Ngày của bức thiệp hiện tại đang xem
  const cardDate = activeLetter ? (activeLetter.date || todayDateString) : todayDateString;
  // 2. Số lần bấm nút "Gửi một cái ôm" trên bức thư này
  const hugCount = state.hugCount || 0;
  // 3. Lựa chọn trong khung "Điều em muốn làm nhất hôm nay"
  const todayWish = getSelectedWishes();

  // Khóa nút bấm & bật trạng thái loading để tránh bấm nhiều lần
  DOM.sendReplyBtn.disabled = true;
  DOM.sendReplyBtn.classList.add("loading");
  DOM.sendText.textContent = "Đang gửi...";
  statusElem.className = "reply-status";
  statusElem.textContent = "Đang gửi lời nhắn của em vào nhật ký...";

  let isSuccess = false;
  let responseErrorMsg = "";

  // Gửi trực tiếp đến Google Apps Script Web App
  if (INTEGRATION_CONFIG.GOOGLE_SCRIPT_URL && INTEGRATION_CONFIG.GOOGLE_SCRIPT_URL.trim() !== "") {
    try {
      // Dùng text/plain để tránh preflight CORS OPTIONS của trình duyệt
      const response = await fetch(INTEGRATION_CONFIG.GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          cardDate: cardDate,
          message: message,
          hugCount: hugCount,
          todayWish: todayWish
        })
      });

      try {
        const jsonRes = await response.json();
        if (jsonRes.status === "success") {
          isSuccess = true;
        } else {
          responseErrorMsg = jsonRes.message || "Lỗi lưu vào Google Sheet";
        }
      } catch (jsonErr) {
        if (response.ok || response.type === "opaque") {
          isSuccess = true;
        }
      }
    } catch (fetchErr) {
      console.warn("Lỗi gửi đến Google Apps Script:", fetchErr);
      responseErrorMsg = "Không thể kết nối đến Google Sheets (Vui lòng kiểm tra quyền truy cập Web App)";
    }
  } else {
    statusElem.className = "reply-status warning";
    statusElem.textContent = "⚠️ Bạn chưa dán link Web App vào GOOGLE_SCRIPT_URL ở đầu file script.js!";
    DOM.sendReplyBtn.disabled = false;
    DOM.sendReplyBtn.classList.remove("loading");
    DOM.sendText.textContent = "Gửi lời nhắn";
    showToast("Hãy điền GOOGLE_SCRIPT_URL trong script.js!", "⚠️", 4000);
    return;
  }

  // Gửi tiếp về Telegram nếu có cấu hình (Gửi kèm số lượt ôm & điều muốn làm)
  if (INTEGRATION_CONFIG.TELEGRAM_BOT_TOKEN && INTEGRATION_CONFIG.TELEGRAM_CHAT_ID) {
    sendTelegramMessage(message, hugCount, todayWish);
  }

  // Khôi phục trạng thái nút bấm
  DOM.sendReplyBtn.disabled = false;
  DOM.sendReplyBtn.classList.remove("loading");
  DOM.sendText.textContent = "Gửi lời nhắn";

  if (isSuccess) {
    // GỬI THÀNH CÔNG: Xóa trắng ô nhập liệu & reset lựa chọn
    replyInput.value = "";
    DOM.replyCharCounter.textContent = "0/500";

    // Reset lựa chọn trong khung "Điều em muốn làm nhất hôm nay"
    document.querySelectorAll(".wish-tag-btn").forEach(btn => btn.classList.remove("selected"));
    if (DOM.wishCustomInput) DOM.wishCustomInput.value = "";
    if (DOM.wishCustomContainer) DOM.wishCustomContainer.style.display = "none";

    statusElem.className = "reply-status success";
    statusElem.textContent = "Lời nhắn của em đã được gửi đi thành công! 💌";

    // Pháo tim bay lượn & giai điệu vui tươi
    spawnHeartsExplosion(24);
    playSuccessMelody();
    showToast("Lời nhắn đã được lưu vào Google Sheet! 💌", "✨", 4000);

    if ("vibrate" in navigator) {
      navigator.vibrate([50, 40, 50]);
    }
  } else {
    statusElem.className = "reply-status error";
    statusElem.textContent = `❌ ${responseErrorMsg || "Chưa thể gửi lúc này"}. Em thử lại nhé!`;
  }
}

/* ==============================================================================
   7. XỬ LÝ MÀN HÌNH KHÓA PASSCODE
   ============================================================================== */
function handlePinInput(digit) {
  if (state.currentPin.length >= 4) return;

  state.currentPin += digit;
  updatePinDisplay();
  playSoftBeep(520, 0.08);

  if (state.currentPin.length === 4) {
    verifyPin();
  }
}

function handleBackspace() {
  if (state.currentPin.length > 0) {
    state.currentPin = state.currentPin.slice(0, -1);
    updatePinDisplay();
    playSoftBeep(380, 0.06);
    DOM.pinMessage.textContent = "";
  }
}

function updatePinDisplay() {
  DOM.pinDots.forEach((dot, index) => {
    if (index < state.currentPin.length) {
      dot.classList.add("filled");
    } else {
      dot.classList.remove("filled");
    }
  });
}

function verifyPin() {
  const targetPin = (appData.config && appData.config.passcode) || "0508";

  if (state.currentPin === targetPin) {
    playSuccessMelody();
    DOM.pinMessage.style.color = "#15803d";
    DOM.pinMessage.textContent = "Mật mã chính xác! Đang mở... 💖";

    setTimeout(() => {
      transitionScreen(DOM.lockScreen, DOM.envelopeScreen);
      state.isUnlocked = true;
      startBackgroundMusic();
    }, 600);
  } else {
    playErrorBuzz();
    const pinDisplay = document.getElementById("pin-display");
    pinDisplay.classList.add("shake");
    DOM.pinMessage.style.color = "#dc2626";
    DOM.pinMessage.textContent = "Mật mã chưa đúng rồi nè, thử lại nhé... 🥺";

    if ("vibrate" in navigator) {
      navigator.vibrate([60, 40, 60]);
    }

    setTimeout(() => {
      pinDisplay.classList.remove("shake");
      state.currentPin = "";
      updatePinDisplay();
    }, 700);
  }
}

/* ==============================================================================
   8. HIỆU ỨNG MỞ PHONG BÌ & CON DẤU SÁP (CHUẨN HÓA QUỸ ĐẠO THẲNG ĐỨNG)
   ============================================================================== */
function openEnvelope() {
  if (state.isEnvelopeOpen) return;
  state.isEnvelopeOpen = true;

  // Giai đoạn 1 (0s - 0.5s): Con dấu sáp nứt nhẹ hoặc mờ dần tự nhiên + âm thanh & phản hồi xúc giác
  playWaxSealCrackSound();
  if ("vibrate" in navigator) {
    navigator.vibrate([25, 30, 35]);
  }
  DOM.waxSeal.classList.add("cracking");
  DOM.envelope.classList.add("opening");
  DOM.tapSealHint.style.opacity = "0";
  spawnMiniHeartsAround(DOM.waxSeal);

  // Giai đoạn 2 (0.3s - 0.9s): Nắp phong bì lật mở 3D (rotateX 180deg), qua 90 độ z-index đổi xuống dưới lá thư
  setTimeout(() => {
    DOM.envelope.classList.add("open-flap");
  }, 300);

  // Bước 1 (0.7s - 1.2s): Lá thư trượt thẳng đứng lên trên theo trục Y (transform: translate(-50%, -65%) scale(0.98))
  setTimeout(() => {
    DOM.envelope.classList.add("slide-paper");
  }, 700);

  // Bước 2 (1.2s - 1.8s): Phong bì trượt nhẹ xuống và mờ dần, lá thư hạ nhẹ về đúng chính giữa màn hình
  setTimeout(() => {
    DOM.envelopeScreen.classList.add("exiting");
    transitionScreen(DOM.envelopeScreen, DOM.letterScreen, () => {
      // Sau khi lá thư mở hoàn tất trên màn hình, kích hoạt hiệu ứng gõ chữ
      setTimeout(() => {
        startTypewriter();
      }, 400);
    });
  }, 1200);
}

function transitionScreen(fromScreen, toScreen, callback) {
  toScreen.classList.add("active");
  fromScreen.classList.remove("active");
  setTimeout(() => {
    if (callback) callback();
  }, 400);
}

/* ==============================================================================
   9. BỘ ĐẾM SỐ NGÀY YÊU NHAU (LOVE COUNTER)
   ============================================================================== */
function calculateDaysInLove() {
  const anniversaryStr = (appData.config && appData.config.anniversaryDate) || "2026-26-07";
  const startDate = new Date(anniversaryStr);
  const today = new Date();
  
  const diffTime = today - startDate;
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  animateCounter(DOM.loveDaysCount, diffDays, 1400);

  const years = Math.floor(diffDays / 365);
  const remainingDays = diffDays % 365;
  const months = Math.floor(remainingDays / 30);
  
  let detailStr = "từng ngày qua đều ngập tràn yêu thương...";
  if (years > 0) {
    detailStr = `Hơn ${years} năm ${months > 0 ? months + " tháng " : ""}bên nhau ngọt ngào!`;
  }
  DOM.loveTimeDetail.textContent = detailStr;
}

function animateCounter(element, targetValue, duration) {
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(targetValue * easeProgress);

    element.textContent = currentValue.toLocaleString("vi-VN");

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      element.textContent = targetValue.toLocaleString("vi-VN");
    }
  }

  requestAnimationFrame(updateNumber);
}

/* ==============================================================================
   10. HIỆU ỨNG ĐÁNH MÁY (TYPEWRITER EFFECT)
   ============================================================================== */
function startTypewriter() {
  clearTimeout(state.typingTimeout);
  state.isTypingDone = false;

  const paragraphs = activeLetter.message || [
    "Thương gửi em yêu,",
    "Cảm ơn em vì đã đến và sưởi ấm thế giới của anh mỗi ngày!"
  ];

  let currentParagraphIndex = 0;
  let charIndex = 0;
  DOM.typewriterContent.innerHTML = "";
  DOM.typewriterCursor.style.display = "inline-block";
  DOM.skipTypingBtn.style.display = "inline-block";

  function typeNextChar() {
    if (state.isTypingDone) return;

    if (currentParagraphIndex < paragraphs.length) {
      const currentPara = paragraphs[currentParagraphIndex];
      
      let pElem = DOM.typewriterContent.children[currentParagraphIndex];
      if (!pElem) {
        pElem = document.createElement("p");
        DOM.typewriterContent.appendChild(pElem);
      }

      if (charIndex < currentPara.length) {
        pElem.textContent += currentPara[charIndex];
        charIndex++;
        const delay = Math.floor(Math.random() * 18) + 22;
        state.typingTimeout = setTimeout(typeNextChar, delay);
      } else {
        currentParagraphIndex++;
        charIndex = 0;
        state.typingTimeout = setTimeout(typeNextChar, 220);
      }
    } else {
      finishTypewriter();
    }
  }

  typeNextChar();
}

function skipTypewriter() {
  clearTimeout(state.typingTimeout);
  const paragraphs = activeLetter.message || [];
  DOM.typewriterContent.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join("");
  finishTypewriter();
}

function finishTypewriter() {
  state.isTypingDone = true;
  DOM.typewriterCursor.style.display = "none";
  DOM.skipTypingBtn.style.display = "none";
}

/* ==============================================================================
   11. HỘP THƯ KỶ NIỆM (ARCHIVE DRAWER)
   ============================================================================== */
function openArchiveModal() {
  renderArchiveCards();
  DOM.archiveModal.classList.add("active");
  DOM.archiveModal.setAttribute("aria-hidden", "false");
}

function closeArchiveModal() {
  DOM.archiveModal.classList.remove("active");
  DOM.archiveModal.setAttribute("aria-hidden", "true");
}

function renderArchiveCards() {
  const letters = appData.letters || [];
  DOM.archiveCardsList.innerHTML = "";

  const sortedLetters = [...letters].sort((a, b) => b.date.localeCompare(a.date));
  const hasToday = sortedLetters.some(l => l.date === todayDateString);
  const displayLetters = (!hasToday && activeLetter) ? [activeLetter, ...sortedLetters] : sortedLetters;

  displayLetters.forEach(letter => {
    const isFuture = letter.date > todayDateString;
    const isCurrentReading = activeLetter && activeLetter.date === letter.date;
    const isToday = letter.date === todayDateString;

    const card = document.createElement("div");
    card.className = `archive-card ${isFuture ? "locked" : ""} ${isCurrentReading ? "active-reading" : ""}`;

    let statusBadge = "";
    if (isFuture) {
      statusBadge = `<span class="status-chip locked">🔒 Khóa</span>`;
    } else if (isCurrentReading) {
      statusBadge = `<span class="status-chip current">Đang đọc</span>`;
    } else if (isToday) {
      statusBadge = `<span class="status-chip open">✨ Hôm nay</span>`;
    } else {
      statusBadge = `<span class="status-chip open">💌 Đọc lại</span>`;
    }

    card.innerHTML = `
      <img src="${letter.imageUrl}" alt="${letter.title}" class="archive-card-thumb" loading="lazy">
      <div class="archive-card-info">
        <span class="archive-card-date-badge">${formatDateToVietnamese(letter.date)}</span>
        <h4 class="archive-card-title">${letter.title}</h4>
        <p class="archive-card-meta">${letter.letterNumber || "Thư kỷ niệm"}</p>
      </div>
      <div class="archive-card-action">
        ${statusBadge}
      </div>
    `;

    card.addEventListener("click", () => {
      if (isFuture) {
        card.classList.add("shake-subtle");
        setTimeout(() => card.classList.remove("shake-subtle"), 400);

        showToast("Bí mật của ngày mai, quay lại sau nhé! 🤫✨", "🔒");

        if ("vibrate" in navigator) {
          navigator.vibrate([40, 30, 40]);
        }
      } else {
        activeLetter = letter;
        renderCurrentLetter();
        closeArchiveModal();

        if (!state.isUnlocked) {
          showToast("Mở khóa thiệp trước đã em nhé! 💖", "💌");
        } else {
          if (DOM.envelopeScreen.classList.contains("active")) {
            openEnvelope();
          } else {
            showToast(`Đang đọc: ${letter.letterNumber}`, "📖");
            startTypewriter();
          }
        }
      }
    });

    DOM.archiveCardsList.appendChild(card);
  });
}

/* ==============================================================================
   12. TOAST THÔNG BÁO DỄ THƯƠNG
   ============================================================================== */
let toastTimeout = null;
function showToast(message, icon = "✨", duration = 3000) {
  DOM.toastMessage.textContent = message;
  DOM.toastIcon.textContent = icon;
  DOM.toastNotification.classList.add("active");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    DOM.toastNotification.classList.remove("active");
  }, duration);
}

/* ==============================================================================
   13. TƯƠNG TÁC "GỬI MỘT CÁI ÔM" (HEART EXPLOSION)
   ============================================================================== */
function handleSendHug() {
  state.hugCount++;
  DOM.hugCounter.textContent = state.hugCount;

  const hugMessages = [
    "Cảm ơn cái ôm thật chặt của em! 💕",
    "Gửi lại em ngàn nụ hôn ngọt ngào! 🌸",
    "Trái tim anh đang đập rộn ràng vì em nè! 💓",
    "Em là điều tuyệt vời nhất thế gian! ✨",
    "Một cái ôm ấm áp xua tan mọi mỏi mệt! 🥰"
  ];

  const randomMsg = hugMessages[state.hugCount % hugMessages.length];
  DOM.hugFeedback.textContent = randomMsg;
  DOM.hugFeedback.style.color = "#e11d48";
  DOM.hugFeedback.style.fontWeight = "600";

  if ("vibrate" in navigator) {
    navigator.vibrate([40, 60, 40]);
  }

  playHeartPopSound();
  spawnHeartsExplosion(24);
}

function spawnHeartsExplosion(count) {
  const heartIcons = ["💖", "💕", "💓", "💗", "🌸", "✨", "💌", "🥰", "🌹"];

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("div");
    heart.className = "floating-heart-item";
    heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];

    const startX = Math.random() * 85 + 5;
    const driftX = (Math.random() - 0.5) * 140;
    const rotation = (Math.random() - 0.5) * 90;
    const fontSize = Math.floor(Math.random() * 18) + 18;
    const duration = (Math.random() * 1.4 + 2.4).toFixed(2);
    const delay = (Math.random() * 0.4).toFixed(2);

    heart.style.left = `${startX}vw`;
    heart.style.fontSize = `${fontSize}px`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay = `${delay}s`;
    heart.style.setProperty("--drift-x", `${driftX}px`);
    heart.style.setProperty("--rot-deg", `${rotation}deg`);

    DOM.heartsContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, (parseFloat(duration) + parseFloat(delay)) * 1000 + 200);
  }
}

function spawnMiniHeartsAround(targetElement) {
  const rect = targetElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 12; i++) {
    const mini = document.createElement("div");
    mini.style.position = "fixed";
    mini.style.left = `${centerX}px`;
    mini.style.top = `${centerY}px`;
    mini.style.fontSize = "18px";
    mini.style.pointerEvents = "none";
    mini.style.zIndex = "999";
    mini.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
    mini.textContent = i % 2 === 0 ? "✨" : "💖";

    document.body.appendChild(mini);

    const angle = (i / 12) * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    requestAnimationFrame(() => {
      mini.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
      mini.style.opacity = "0";
    });

    setTimeout(() => mini.remove(), 850);
  }
}

/* ==============================================================================
   14. ĐIỀU KHIỂN ÂM THANH & NHẠC NỀN
   ============================================================================== */
function toggleMusic() {
  if (state.isAudioPlaying) {
    pauseBackgroundMusic();
  } else {
    startBackgroundMusic();
  }
}

function startBackgroundMusic() {
  if (appData.config && appData.config.musicUrl) {
    DOM.bgAudio.src = appData.config.musicUrl;
  }

  DOM.bgAudio.play()
    .then(() => {
      state.isAudioPlaying = true;
      DOM.musicToggleBtn.classList.add("playing");
      DOM.musicToggleBtn.setAttribute("title", "Đang phát nhạc (Nhấp để dừng)");
    })
    .catch(() => {
      initWebAudioFallback();
      state.isAudioPlaying = true;
      DOM.musicToggleBtn.classList.add("playing");
    });
}

function pauseBackgroundMusic() {
  DOM.bgAudio.pause();
  state.isAudioPlaying = false;
  DOM.musicToggleBtn.classList.remove("playing");
  DOM.musicToggleBtn.setAttribute("title", "Nhạc đang tắt (Nhấp để bật)");
}

function getAudioContext() {
  if (!state.audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      state.audioContext = new AudioCtx();
    }
  }
  if (state.audioContext && state.audioContext.state === "suspended") {
    state.audioContext.resume();
  }
  return state.audioContext;
}

function playSoftBeep(freq = 440, duration = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playSuccessMelody() {
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      setTimeout(() => playSoftBeep(freq, 0.18), index * 100);
    });
  } catch (e) {}
}

function playErrorBuzz() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

function playWaxSealCrackSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Lớp 1: Tiếng nứt giòn sắc của con dấu sáp (crisp wax snap)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(820, now);
    osc1.frequency.exponentialRampToValueAtTime(140, now + 0.08);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Lớp 2: Tiếng tách mép sáp và trượt giấy đằm ấm
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(320, now + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(75, now + 0.22);
    gain2.gain.setValueAtTime(0.18, now + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.03);
    osc2.stop(now + 0.22);
  } catch (e) {}
}

function playHeartPopSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const baseFreq = 580 + Math.random() * 200;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

let ambientInterval = null;
function initWebAudioFallback() {
  if (ambientInterval) return;
  const arpeggio = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23];
  let noteIndex = 0;
  ambientInterval = setInterval(() => {
    if (!state.isAudioPlaying) return;
    playSoftBeep(arpeggio[noteIndex % arpeggio.length], 0.6);
    noteIndex++;
  }, 1200);
}

/* ==============================================================================
   15. HIỆU ỨNG CÁNH HOA BAY TRÊN CANVAS (AMBIENT SAKURA)
   ============================================================================== */
function initAmbientPetals() {
  const canvas = DOM.ambientCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const petalCount = window.innerWidth < 600 ? 18 : 28;

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 0.8 + 0.5;
      this.speedX = Math.random() * 0.6 - 0.3;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.03;
      this.color = Math.random() > 0.4 ? "rgba(244, 114, 182, 0.3)" : "rgba(251, 191, 36, 0.22)";
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.angle) * 0.5 + this.speedX;
      this.angle += this.spinSpeed;

      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < petalCount; i++) {
    petals.push(new Petal());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==============================================================================
   16. THIẾT LẬP CÁC SỰ KIỆN LẮNG NGHE (EVENT LISTENERS)
   ============================================================================== */
function setupEventListeners() {
  // Bàn phím số ảo
  DOM.numpad.addEventListener("click", e => {
    const key = e.target.closest(".num-key");
    if (!key) return;

    if (key.dataset.key) {
      handlePinInput(key.dataset.key);
    } else if (key.id === "backspace-btn") {
      handleBackspace();
    } else if (key.id === "hint-btn") {
      DOM.passcodeHint.style.display = "block";
      DOM.passcodeHint.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Bàn phím máy tính
  document.addEventListener("keydown", e => {
    if (!state.isUnlocked) {
      if (e.key >= "0" && e.key <= "9") {
        handlePinInput(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      }
    }
  });

  // Mở con dấu sáp
  DOM.waxSeal.addEventListener("click", openEnvelope);

  // Gửi cái ôm
  DOM.sendHugBtn.addEventListener("click", handleSendHug);

  // Đọc nhanh bức thư
  DOM.skipTypingBtn.addEventListener("click", skipTypewriter);

  // Bật/tắt nhạc
  DOM.musicToggleBtn.addEventListener("click", toggleMusic);

  // Lựa chọn trong khung "Điều em muốn làm nhất hôm nay"
  if (DOM.wishTagsGrid) {
    DOM.wishTagsGrid.addEventListener("click", e => {
      const tagBtn = e.target.closest(".wish-tag-btn");
      if (!tagBtn) return;

      tagBtn.classList.toggle("selected");
      playSoftBeep(650, 0.05);

      // Nếu bấm nút "Lựa chọn khác..."
      if (tagBtn.id === "wish-other-toggle") {
        if (tagBtn.classList.contains("selected")) {
          if (DOM.wishCustomContainer) {
            DOM.wishCustomContainer.style.display = "block";
            if (DOM.wishCustomInput) DOM.wishCustomInput.focus();
          }
        } else {
          if (DOM.wishCustomContainer) {
            DOM.wishCustomContainer.style.display = "none";
          }
        }
      }
    });
  }

  // Bộ đếm ký tự & Gửi phản hồi về Telegram
  if (DOM.replyTextInput) {
    DOM.replyTextInput.addEventListener("input", () => {
      const len = DOM.replyTextInput.value.length;
      DOM.replyCharCounter.textContent = `${len}/500`;
    });
  }

  if (DOM.sendReplyBtn) {
    DOM.sendReplyBtn.addEventListener("click", handleSendReply);
  }

  // Mở và đóng Hộp Thư Kỷ Niệm (Archive Modal)
  DOM.archiveToggleBtn.addEventListener("click", openArchiveModal);
  DOM.openArchiveFromFooterBtn.addEventListener("click", openArchiveModal);
  DOM.closeArchiveBtn.addEventListener("click", closeArchiveModal);
  DOM.archiveBackdrop.addEventListener("click", closeArchiveModal);

  // Nút đóng thư và đọc lại từ đầu
  DOM.rewatchBtn.addEventListener("click", () => {
    state.isUnlocked = false;
    state.isEnvelopeOpen = false;
    state.isLetterRevealed = false;
    state.isTypingDone = false;
    state.currentPin = "";
    updatePinDisplay();
    DOM.pinMessage.textContent = "";

    // Reset toàn bộ trạng thái chuyển động của phong bì & con dấu sáp
    DOM.envelope.classList.remove("opening", "open-flap", "slide-paper");
    DOM.envelopeScreen.classList.remove("exiting");
    DOM.waxSeal.classList.remove("cracking");
    DOM.waxSeal.style.opacity = "";
    DOM.waxSeal.style.transform = "";
    DOM.tapSealHint.style.opacity = "1";

    DOM.skipTypingBtn.style.display = "inline-block";
    transitionScreen(DOM.letterScreen, DOM.lockScreen);
  });
}

/* ==============================================================================
   17. ĐĂNG KÝ PROGRESSIVE WEB APP (SERVICE WORKER & PWA INSTALL)
   ============================================================================== */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Chỉ đăng ký khi chạy qua http, https hoặc localhost (tránh lỗi file://)
      if (window.location.protocol === "http:" || window.location.protocol === "https:") {
        navigator.serviceWorker
          .register("./sw.js")
          .then(registration => {
            console.log("✅ PWA Service Worker đã đăng ký thành công:", registration.scope);
          })
          .catch(error => {
            console.log("ℹ️ Đăng ký Service Worker:", error.message);
          });
      } else {
        console.log("ℹ️ Đang chạy ở chế độ file:// cục bộ, Service Worker sẽ hoạt động khi bạn đưa lên web hosting hoặc Live Server.");
      }
    });
  }
}
