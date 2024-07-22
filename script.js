function calculateDamage() {
    // Lấy giá trị từ input
    const atk = parseFloat(document.getElementById('atk').value);
    const dmgBuffInput = document.getElementById('dmgBuff').value;
    const penetrationInput = document.getElementById('penetration').value;
    const weaponType = document.getElementById('weaponType').value;
    const element = document.getElementById('element').value;
    const def = parseFloat(document.getElementById('def').value);
    const hp = parseFloat(document.getElementById('hp').value);
    const hasBlock = document.getElementById('block').value === 'true';
    const distance = parseFloat(document.getElementById('distance').value);

    // Xử lý buff khuếch đại sát thương và xuyên kháng
    const dmgBuff = dmgBuffInput ? parseFloat(dmgBuffInput) / 100 : 0;
    const penetration = penetrationInput ? parseFloat(penetrationInput) / 100 : 0;

    // Tính toán hit-rate
    const weaponRange = weaponType === 'melee' ? 15 : 70;
    const hitRateReduction = Math.floor(distance / (weaponRange / 3)) * 0.2;
    const hitRate = Math.max(0, 1 - hitRateReduction);

    // Tính toán sát thương
    let damage = atk * (1 + dmgBuff);
    if (element === 'normal' && hp === 100) {
        damage *= 1.05;
    }

    const effectiveDef = def * (hasBlock ? 2 : 1) * (1 - penetration);
    damage = Math.max(0, damage - effectiveDef);
    damage *= hitRate;

    // Hiển thị kết quả
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = `
        Sát thương gây ra: ${damage.toFixed(2)}<br>
        Hit-rate: ${(hitRate * 100).toFixed(2)}%
    `;
}