// Hàm tính toán sát thương
function calculateDamage() {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.style.display = 'none'; // Ẩn thông báo lỗi cũ

    // Kiểm tra các trường bắt buộc
    const requiredFields = [
        { id: 'atk', name: 'ATK' },
        { id: 'def', name: 'DEF' },
        { id: 'currentHP', name: 'HP hiện tại' },
        { id: 'maxHP', name: 'HP tối đa' },
        { id: 'distance', name: 'Khoảng cách' }
    ];
    let missingFields = [];

    for (let field of requiredFields) {
        const value = document.getElementById(field.id).value.trim();
        if (value === '') {
            missingFields.push(field.name);
        }
    }

    if (missingFields.length > 0) {
        errorMessageElement.textContent = `Vui lòng nhập đầy đủ các trường sau: ${missingFields.join(', ')}`;
        errorMessageElement.style.display = 'block';
        return; // Dừng hàm nếu có trường chưa được nhập
    }

    // Lấy giá trị từ input
    const atk = parseFloat(document.getElementById('atk').value);
    const dmgBuff = parseFloat(document.getElementById('dmgBuff').value) / 100 || 0;
    const penetration = parseFloat(document.getElementById('penetration').value) / 100 || 0;
    const weaponType = document.getElementById('weaponType').value;
    const rangedWeaponType = document.getElementById('rangedWeaponType').value;
    const attackerElement = document.getElementById('attackerElement').value;
    const accModifier = parseFloat(document.getElementById('accModifier').value) / 100 || 0;
    const def = parseFloat(document.getElementById('def').value);
    const currentHP = parseFloat(document.getElementById('currentHP').value);
    const maxHP = parseFloat(document.getElementById('maxHP').value);
    const defenderAction = document.getElementById('defenderAction').value;
    const evasion = parseFloat(document.getElementById('evasion').value) / 100 || 0;
    const evaModifier = parseFloat(document.getElementById('evaModifier').value) / 100 || 0;
    const distance = parseFloat(document.getElementById('distance').value);
    const defenderElement = document.getElementById('defenderElement').value;
    const damageReduction = parseFloat(document.getElementById('damageReduction').value) / 100 || 0;

    // Tính phần trăm HP hiện tại
    const hpPercentage = (currentHP / maxHP) * 100;

    // Tính toán hiệu ứng nguyên tố của người phòng thủ
    let defReduction = 0;
    let dotDamage = 0;

    if (defenderElement === 'burn') {
        defReduction = 0.1; // Giảm 10% DEF
        dotDamage = 0.03 * maxHP; // 3% HP tối đa
    } else if (defenderElement === 'beam') {
        defReduction = 0.2; // Giảm 20% DEF
    } else if (defenderElement === 'poison') {
        dotDamage = 0.03 * maxHP; // 3% HP tối đa
    }
    
    // Áp dụng giảm DEF từ hiệu ứng
    let effectiveDef = def * (1 - defReduction);

    // Tính toán sát thương cơ bản
    let baseDamage = atk;
    
    // Áp dụng hệ số sát thương dựa trên loại vũ khí
    let weaponDamageMultiplier = 1;
    if (weaponType === 'ranged') {
        switch (rangedWeaponType) {
            case 'mainArmament':
                weaponDamageMultiplier = 0.8;
                break;
            case 'secondaryArmament':
                weaponDamageMultiplier = 0.6;
                break;
            case 'missile':
                weaponDamageMultiplier = 0.4;
                break;
            case 'ultimateWeapon':
                weaponDamageMultiplier = 1.5;
                break;
        }
    }
    baseDamage *= weaponDamageMultiplier;

    // Áp dụng hiệu ứng nguyên tố của người tấn công
    let elementalMultiplier = 1;
    if (attackerElement === 'normal') {
        if (hpPercentage <= 25) elementalMultiplier = 1.20;
        else if (hpPercentage <= 50) elementalMultiplier = 1.15;
        else if (hpPercentage <= 75) elementalMultiplier = 1.10;
        else if (hpPercentage < 100) elementalMultiplier = 1.05;
    } else if (attackerElement === 'explosive') {
        const hpLost = (100 - hpPercentage) / 10;
        const defIgnore = hpLost * 0.025;
        effectiveDef *= (1 - defIgnore);
    }
    baseDamage *= elementalMultiplier;

    // Áp dụng khuếch đại sát thương và giảm sát thương
    let damageMultiplier = 1 + dmgBuff - damageReduction;
    damageMultiplier = Math.max(0, damageMultiplier); // Đảm bảo hệ số không âm

    // Tính toán sát thương cuối cùng
    effectiveDef *= (defenderAction === 'block' ? 2 : 1) * (1 - penetration);
    let finalDamage = Math.max(0, baseDamage * damageMultiplier - effectiveDef);

    // Tính toán hit-rate
    let baseHitRate = 1;
    const maxRange = weaponType === 'melee' ? 15 : 70;
    let finalHitRate;
    if (distance <= maxRange) {
        const hitRateReduction = Math.floor(distance / (maxRange / 3)) * 0.2;
        baseHitRate = Math.max(0, 1 - hitRateReduction);

        // Áp dụng công thức mới
        finalHitRate = baseHitRate + accModifier - evaModifier;
        if (defenderAction === 'evasion') {
            finalHitRate *= (1 - evasion);
        }
        finalHitRate = Math.max(0, Math.min(1, finalHitRate)); // Đảm bảo hit-rate nằm trong khoảng [0, 1]
    } else {
        // Nếu vượt quá phạm vi tấn công, Hit rate = 0%
        finalHitRate = 0;
    }

    // Hiển thị kết quả
    displayResults(finalDamage, finalHitRate, dotDamage, {
        atk, dmgBuff, penetration, weaponType, rangedWeaponType, attackerElement, def, currentHP, maxHP, defenderAction, evasion, distance, defenderElement, defReduction, effectiveDef, hpPercentage, damageMultiplier, damageReduction, weaponDamageMultiplier, elementalMultiplier, accModifier, evaModifier, baseHitRate
    });
}

function displayResults(damage, hitRate, dotDamage, params) {
    const resultElement = document.getElementById('result');
    let output = '<h3>Kết quả tính toán:</h3>';

    // Hiển thị kết quả chính
    output += `<div class="main-result">
        <p><strong>Sát thương gây ra:</strong> <span class="highlight">${damage.toFixed(2)}</span></p>
        <p><strong>Hit-rate:</strong> <span class="highlight">${(hitRate * 100).toFixed(2)}%</span></p>`;
    
    if (dotDamage > 0) {
        output += `<p><strong>Sát thương theo thời gian (DoT):</strong> <span class="highlight">${dotDamage.toFixed(2)}</span></p>`;
    }
    
    output += `</div>`;

    // Hiển thị công thức tính sát thương
    output += '<h4>Công thức tính sát thương:</h4>';
    output += '<pre>';
    output += `1. Sát thương cơ bản = ATK = ${params.atk.toFixed(2)}\n`;
    
    if (params.weaponType === 'ranged') {
        output += `2. Áp dụng hệ số sát thương cho vũ khí ${params.rangedWeaponType}: ${params.atk.toFixed(2)} * ${params.weaponDamageMultiplier.toFixed(2)} = ${(params.atk * params.weaponDamageMultiplier).toFixed(2)}\n`;
    }
    
    if (params.attackerElement === 'normal') {
        output += `3. Áp dụng bonus nguyên tố Normal (HP ${params.hpPercentage.toFixed(2)}%): ${(params.atk * params.weaponDamageMultiplier).toFixed(2)} * ${params.elementalMultiplier.toFixed(2)} = ${(params.atk * params.weaponDamageMultiplier * params.elementalMultiplier).toFixed(2)}\n`;
    } else if (params.attackerElement === 'explosive') {
        const hpLost = (100 - params.hpPercentage) / 10;
        const defIgnore = hpLost * 0.025;
        output += `3. Áp dụng nguyên tố Explosive: Bỏ qua ${(defIgnore * 100).toFixed(2)}% DEF\n`;
    } else {
        output += `3. Nguyên tố Khác: Không có hiệu ứng đặc biệt\n`;
    }

    output += `4. Áp dụng khuếch đại sát thương và giảm sát thương:\n`;
    output += `   Hệ số cuối cùng = 1 + ${params.dmgBuff.toFixed(2)} (khuếch đại) - ${params.damageReduction.toFixed(2)} (giảm) = ${params.damageMultiplier.toFixed(2)}\n`;
    output += `   Sát thương sau khi áp dụng = ${(params.atk * params.weaponDamageMultiplier * params.elementalMultiplier).toFixed(2)} * ${params.damageMultiplier.toFixed(2)} = ${(params.atk * params.weaponDamageMultiplier * params.elementalMultiplier * params.damageMultiplier).toFixed(2)}\n`;

    if (params.defenderElement !== 'none') {
        output += `5. Áp dụng hiệu ứng ${params.defenderElement}: `;
        if (params.defenderElement === 'burn' || params.defenderElement === 'beam') {
            output += `Giảm ${(params.defReduction * 100).toFixed(2)}% DEF\n`;
        }
        if (params.defenderElement === 'burn' || params.defenderElement === 'poison') {
            output += `   Gây thêm sát thương DoT: 3% của ${params.maxHP.toFixed(2)} = ${dotDamage.toFixed(2)}\n`;
        }
    }

    output += `6. Phòng thủ hiệu quả = DEF * (1 - defReduction) * (2 nếu block) * (1 - penetration) = ${params.def.toFixed(2)} * (1 - ${params.defReduction.toFixed(2)}) * ${params.defenderAction === 'block' ? 2 : 1} * (1 - ${params.penetration.toFixed(2)}) = ${params.effectiveDef.toFixed(2)}\n`;
    output += `7. Sát thương cuối cùng = Max(0, Sát thương - Phòng thủ hiệu quả) = ${damage.toFixed(2)}\n`;
    
    output += `\n8. Tính toán Hit-rate:\n`;
    if (params.distance <= (params.weaponType === 'melee' ? 15 : 70)) {
        output += `   Base Hit-rate: ${(params.baseHitRate * 100).toFixed(2)}%\n`;
        output += `   Áp dụng Acc Modifier: +${(params.accModifier * 100).toFixed(2)}%\n`;
        output += `   Áp dụng Eva Modifier: -${(params.evaModifier * 100).toFixed(2)}%\n`;
        let intermediateHitRate = params.baseHitRate + params.accModifier - params.evaModifier;
        output += `   Hit-rate sau khi áp dụng modifier: ${(intermediateHitRate * 100).toFixed(2)}%\n`;
        if (params.defenderAction === 'evasion') {
            output += `   Áp dụng Evasion: ${(intermediateHitRate * 100).toFixed(2)}% * (1 - ${(params.evasion * 100).toFixed(2)}%) = ${(intermediateHitRate * (1 - params.evasion) * 100).toFixed(2)}%\n`;
        }
        output += `   Final Hit-rate: ${(hitRate * 100).toFixed(2)}%\n`;
    } else {
        output += `   Khoảng cách (${params.distance.toFixed(2)}m) vượt quá tầm đánh tối đa (${params.weaponType === 'melee' ? 15 : 70}m), Hit-rate = 0%\n`;
    }
    output += '</pre>';

    resultElement.innerHTML = output;
}

// Hiển thị modal Help
function showHelp() {
    const modal = document.getElementById('helpModal');
    const content = document.getElementById('helpContent');
    
    content.innerHTML = `
        <h3>Giải thích các trường nhập liệu:</h3>
        <h4 class="attacker">Người Tấn Công (Attacker):</h4>
        <ul>
            <li><strong>ATK:</strong> <span class="description">Sức tấn công của người tấn công.</span></li>
            <li><strong>Buff khuếch đại sát thương:</strong> <span class="description">Phần trăm tăng sát thương (không bắt buộc).</span></li>
            <li><strong>Buff xuyên kháng:</strong> <span class="description">Phần trăm bỏ qua phòng thủ của đối phương (không bắt buộc).</span></li>
            <li><strong>Loại vũ khí:</strong> <span class="description">Melee (cận chiến, tầm đánh <span class="value">15m</span>) hoặc Ranged (tầm xa, tầm đánh <span class="value">70m</span>).</span></li>
            <li><strong>Loại vũ khí tầm xa:</strong>
                <ul>
                    <li><span class="weapon">Main Armament:</span> <span class="description"><span class="value">80% ATK</span>, nạp <span class="value">10% IS</span>, <span class="value">2 lượt</span> nạp đạn.</span></li>
                    <li><span class="weapon">Secondary Armament:</span> <span class="description"><span class="value">60% ATK</span>, nạp <span class="value">8% IS</span>, <span class="value">1 lượt</span> nạp đạn.</span></li>
                    <li><span class="weapon">Missile:</span> <span class="description"><span class="value">40% ATK</span>, nạp <span class="value">5% IS</span>, <span class="value">2 lượt</span> nạp đạn. Có thể dùng cùng lúc với vũ khí khác.</span></li>
                    <li><span class="weapon">Ultimate Weapon:</span> <span class="description"><span class="value">150% ATK</span>, nạp <span class="value">20% IS</span>, <span class="value">7 lượt</span> nạp đạn. Chỉ có ở mecha bậc SS trở lên.</span></li>
                </ul>
            </li>
            <li><strong>Nguyên tố:</strong>
                <ul>
                    <li><span class="element">Normal:</span> <span class="description">Tăng sát thương khi HP đối phương giảm (<span class="value">5%/10%/15%/20%</span> khi HP dưới <span class="value">100%/75%/50%/25%</span>).</span></li>
                    <li><span class="element">Explosive:</span> <span class="description">Bỏ qua <span class="value">2.5% DEF</span> cho mỗi <span class="value">10%</span> máu đã mất của đối phương.</span></li>
                    <li><span class="element">Khác:</span> <span class="description">Không có hiệu ứng đặc biệt.</span></li>
                </ul>
            </li>
            <li><strong>Acc Modifier:</strong> <span class="description">Điều chỉnh độ chính xác của người tấn công (%).</span></li>
        </ul>
        <h4 class="defender">Người Phòng Thủ (Defender):</h4>
        <ul>
            <li><strong>DEF:</strong> <span class="description">Chỉ số phòng thủ của người phòng thủ.</span></li>
            <li><strong>HP hiện tại:</strong> <span class="description">Lượng máu hiện tại của người phòng thủ.</span></li>
            <li><strong>HP tối đa:</strong> <span class="description">Lượng máu tối đa của người phòng thủ.</span></li>
            <li><strong>Hành động:</strong> <span class="description">Chọn hành động của người phòng thủ (Không hành động, Block, hoặc Né tránh).</span></li>
            <li><strong>Evasion:</strong> <span class="description">Tỷ lệ né tránh của người phòng thủ (%) khi chọn hành động Né tránh.</span></li>
            <li><strong>Eva Modifier:</strong> <span class="description">Điều chỉnh khả năng né tránh của người phòng thủ (%). Trừ trực tiếp vào Hit-rate.</span></li>
            <li><strong>Hiệu ứng:</strong>
                <ul>
                    <li><span class="effect">Burn:</span> <span class="description">Gây sát thương <span class="value">3% HP tối đa</span>, giảm <span class="value">10% DEF</span>.</span></li>
                    <li><span class="effect">Poison:</span> <span class="description">Gây sát thương <span class="value">3% HP tối đa</span>.</span></li>
                    <li><span class="effect">Beam:</span> <span class="description">Giảm <span class="value">20% DEF</span>.</span></li>
                </ul>
            </li>
            <li><strong>Giảm sát thương nhận vào (%):</strong> <span class="description">Phần trăm giảm sát thương của người phòng thủ.</span></li>
        </ul>
        <h4 class="distance">Khoảng Cách:</h4>
        <ul>
            <li><span class="description">Khoảng cách giữa người tấn công và người phòng thủ, ảnh hưởng đến hit-rate.</span></li>
            <li><span class="description">Khoảng cách tối đa: Melee <span class="value">15m</span>, Ranged <span class="value">70m</span>. Vượt quá sẽ có hit-rate 0%.</span></li>
        </ul>
        <h4>Cách tính Hit-rate:</h4>
        <p class="description">Hit-rate = (Base hit-rate + Acc modifier - Eva modifier) * (1 - Evasion rate nếu dùng Eva)</p>
        <p class="description">Base hit-rate giảm <span class="value">20%</span> cho mỗi <span class="value">1/3</span> tầm đánh của vũ khí.</p>
        <p class="description">Nếu khoảng cách vượt quá tầm đánh tối đa, Hit-rate = 0%.</p>
    `;
    
    modal.style.display = "block";
}

// Đóng modal Help
function closeHelp() {
    const modal = document.getElementById('helpModal');
    modal.style.display = "none";
}

// Hàm khởi tạo tất cả các event listener
function initializeEventListeners() {
    const calculateButton = document.querySelector('button');
    const helpButton = document.getElementById('helpButton');
    const closeButton = document.querySelector('.close');
    const weaponTypeSelect = document.getElementById('weaponType');
    const rangedWeaponTypeSelect = document.getElementById('rangedWeaponType');
    const defenderActionSelect = document.getElementById('defenderAction');
    const evasionInput = document.getElementById('evasion');

    if (calculateButton) {
        calculateButton.addEventListener('click', calculateDamage);
    }

    if (helpButton) {
        helpButton.addEventListener('click', showHelp);
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeHelp);
    }

    if (weaponTypeSelect) {
        weaponTypeSelect.addEventListener('change', function() {
            if (this.value === 'ranged') {
                rangedWeaponTypeSelect.style.display = 'block';
            } else {
                rangedWeaponTypeSelect.style.display = 'none';
            }
        });
    }

    if (defenderActionSelect) {
        defenderActionSelect.addEventListener('change', function() {
            if (this.value === 'evasion') {
                evasionInput.style.display = 'block';
            } else {
                evasionInput.style.display = 'none';
            }
        });
    }

    // Đóng modal khi click bên ngoài
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('helpModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}

// Đảm bảo DOM đã được tải hoàn toàn trước khi thêm event listeners
document.addEventListener('DOMContentLoaded', initializeEventListeners);