<script>
(function() {
  const SYSTEM_PROMPT = `შენ ხარ ყავის სახლის "ნიო" ვირტუალური ასისტენტი, განთავსებული მათ ვებსაიტზე. გჭირდება მომხმარებლების კითხვებზე პასუხის გაცემა მეგობრულად, მოკლედ და კონკრეტულად, ქართულ ენაზე (გარდა იმ შემთხვევისა, თუ მომხმარებელი სხვა ენაზე წერს — მაშინ იმავე ენაზე უპასუხე).
 
ინფორმაცია "ნიოს" შესახებ:
- მისამართი: ჭავჭავაძის გამზირი 37, ვაკე, თბილისი
- სამუშაო საათები: ორშაბათი-პარასკევი 08:00-22:00, შაბათ-კვირა 09:00-23:00
- მენიუ: ესპრესო 6 ლარი, კაპუჩინო 8 ლარი, ფლეთ უაითი 9 ლარი, ხელნაკეთი ნამცხვრები 7-12 ლარი, ვეგანური ნაყინი 10 ლარი, სანდვიჩები 14-18 ლარი
- გაქვთ მცენარეული რძის ვარიანტები (ნუშის, შვრიის, სოიო) +1 ლარი
- უფასო wifi, ცხოველებთან მისვლა დაშვებულია
- დაჯავშნა შესაძლებელია სატელეფონო ნომერზე 595-00-00-00, მინიმუმ 4 საათით ადრე
- მიწოდება მუშაობს Glovo-სა და Wolt-ის საშუალებით, რადიუსი 3კმ
 
თუ კითხვა სცილდება ამ ინფორმაციას, თავაზიანად უთხარი რომ ამის შესახებ ზუსტი ინფორმაცია არ გაქვს და ურჩიე დარეკოს. პასუხი არ უნდა აღემატებოდეს 3-4 წინადადებას.`;
 
  const messagesEl = document.getElementById('cbMessages');
  const inputEl = document.getElementById('cbInput');
  const sendBtn = document.getElementById('cbSend');
  const chipsEl = document.getElementById('cbChips');
  let history = [];
  let busy = false;
 
  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'cb-msg ' + (role === 'user' ? 'user' : 'bot');
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }
 
  function showTyping() {
    const div = document.createElement('div');
    div.className = 'cb-msg typing';
    div.innerHTML = '<span class="cb-dot"></span><span class="cb-dot"></span><span class="cb-dot"></span>';
    div.id = 'cbTyping';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
 
  function hideTyping() {
    const t = document.getElementById('cbTyping');
    if (t) t.remove();
  }
 
  async function sendMessage(text) {
    if (!text.trim() || busy) return;
    busy = true;
    sendBtn.disabled = true;
    if (chipsEl) chipsEl.style.display = 'none';
 
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    inputEl.value = '';
    showTyping();
 
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history
        })
      });
      const data = await response.json();
      const reply = (data.content || [])
        .map(block => block.type === 'text' ? block.text : '')
        .filter(Boolean)
        .join('\n') || 'ბოდიში, ამჟამად ვერ ვპასუხობ. სცადეთ ხელახლა.';
 
      hideTyping();
      addMessage('bot', reply);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      hideTyping();
      addMessage('bot', 'დაფიქსირდა შეცდომა კავშირში. სცადეთ ხელახლა.');
      console.error('Chat error:', err);
    } finally {
      busy = false;
      sendBtn.disabled = false;
    }
  }
 
  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(inputEl.value);
  });
  chipsEl.querySelectorAll('.cb-chip').forEach(chip => {
    chip.addEventListener('click', () => sendMessage(chip.dataset.q));
  });
})();
</script>
 
