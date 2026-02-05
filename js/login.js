const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQO69CffRjbxs22pLQEAUPNLU2A6INK4JflcXIe96bzbK-5YGdsjzMxW09SFi5AyEoCpdFuU90x1DRU/pub?gid=0&single=true&output=csv"; 

        async function handleLogin() {
            const inputField = document.getElementById('inputField');
            const messageField = document.getElementById('message');
            const btn = document.getElementById('loginBtn');
            const loader = document.getElementById('loader');
            
            const userInput = inputField.value.trim().toUpperCase();
            if(!userInput) return;

            loader.style.display = "inline-block";
            btn.style.display = "none";
            messageField.innerText = "";

            try {
                const msgUint8 = new TextEncoder().encode(userInput);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashedInput = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                const response = await fetch(CSV_URL, { cache: 'no-cache' });
                const data = await response.text();
                
                const validHashes = data.split(/\r?\n/)
                                   .map(h => h.replace(/[^a-zA-Z0-9]/g, "").trim())
                                   .filter(h => h.length > 0);

                const cleanInput = hashedInput.replace(/[^a-zA-Z0-9]/g, "").trim();

                await new Promise(resolve => setTimeout(resolve, 800));

                if (validHashes.includes(cleanInput)) {
                    window.location.href = "../html/geheim.html";
                } else {
                    messageField.innerText = "Access Denied.";
                    messageField.style.color = "#ff9999";
                    loader.style.display = "none";
                    btn.style.display = "block";
                }
            } catch (e) {
                messageField.innerText = "Connection Error.";
                loader.style.display = "none";
                btn.style.display = "block";
            }
        }

        document.getElementById('inputField').addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                handleLogin();
            }
        });