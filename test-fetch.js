const testLogin = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/test-login");
        const json = await res.json();
        console.log("RESPONSE:", json);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
testLogin();
