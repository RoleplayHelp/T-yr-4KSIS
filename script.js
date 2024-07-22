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
    const def = parseFloat(document.getElementById('def').value);
    const currentHP = parseFloat(document.getElementById('currentHP').value);
    const maxHP = parseFloat(document.getElementById('maxHP').value);
    const hasBlock = document.getElementById('block').value === 'true';
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
    effectiveDef *= (hasBlock ? 2 : 1) * (1 - penetration);
    let finalDamage = Math.max(0, baseDamage * damageMultiplier - effectiveDef);

    // Tính toán hit-rate
    let hitRate = 1;
    const maxRange = weaponType === 'melee' ? 15 : 70;
    if (distance > maxRange) {
        hitRate = 0;
    } else {
        const hitRateReduction = Math.floor(distance / (maxRange / 3)) * 0.2;
        hitRate = Math.max(0, 1 - hitRateReduction);
    }

    // Hiển thị kết quả
    displayResults(finalDamage, hitRate, dotDamage, {
        atk, dmgBuff, penetration, weaponType, rangedWeaponType, attackerElement, def, currentHP, maxHP, hasBlock, distance, defenderElement, defReduction, effectiveDef, hpPercentage, damageMultiplier, damageReduction, weaponDamageMultiplier, elementalMultiplier
    });
}

function displayResults(damage, hitRate, dotDamage, params) {
    const resultElement = document.getElementById('result');
    let output = '<h3>Kết quả tính toán:</h3>';

    // Hiển thị kết quả chính
    output += `<div class="main-result">
        <p><strong>Sát thương phải nhận:</strong> <span class="highlight">${damage.toFixed(2)}</span></p>
        <p><strong>Hit-rate:</strong> <span class="highlight">${(hitRate * 100).toFixed(2)}%</span></p>`;
    
    if (dotDamage > 0) {
        output += `<p><strong>Sát thương theo thời gian (DoT):</strong> <span class="highlight">${dotDamage.toFixed(2)}</span></p>`;
    }
    
    output += `</div>`;

    // Hiển thị công thức tính sát thương
    output += '<h4>Công thức tính sát thương:</h4>';
    output += '<pre>';
    output += `1. Sát thương cơ bản = ATK = ${params.atk}\n`;
    
    if (params.weaponType === 'ranged') {
        output += `2. Áp dụng hệ số sát thương cho vũ khí ${params.rangedWeaponType}: ${params.atk} * ${params.weaponDamageMultiplier} = ${params.atk * params.weaponDamageMultiplier}\n`;
    }
    
    if (params.attackerElement === 'normal') {
        output += `3. Áp dụng bonus nguyên tố Normal (HP ${params.hpPercentage.toFixed(2)}%): ${params.atk * params.weaponDamageMultiplier} * ${params.elementalMultiplier} = ${params.atk * params.weaponDamageMultiplier * params.elementalMultiplier}\n`;
    } else if (params.attackerElement === 'explosive') {
        const hpLost = (100 - params.hpPercentage) / 10;
        const defIgnore = hpLost * 0.025;
        output += `3. Áp dụng nguyên tố Explosive: Bỏ qua ${(defIgnore * 100).toFixed(2)}% DEF\n`;
    } else {
        output += `3. Nguyên tố Khác: Không có hiệu ứng đặc biệt\n`;
    }

    output += `4. Áp dụng khuếch đại sát thương và giảm sát thương:\n`;
    output += `   Hệ số cuối cùng = 1 + ${params.dmgBuff} (khuếch đại) - ${params.damageReduction} (giảm) = ${params.damageMultiplier}\n`;
    output += `   Sát thương sau khi áp dụng = ${params.atk * params.weaponDamageMultiplier * params.elementalMultiplier} * ${params.damageMultiplier} = ${params.atk * params.weaponDamageMultiplier * params.elementalMultiplier * params.damageMultiplier}\n`;

    if (params.defenderElement !== 'none') {
        output += `5. Áp dụng hiệu ứng ${params.defenderElement}: `;
        if (params.defenderElement === 'burn' || params.defenderElement === 'beam') {
            output += `Giảm ${params.defReduction * 100}% DEF\n`;
        }
        if (params.defenderElement === 'burn' || params.defenderElement === 'poison') {
            output += `   Gây thêm sát thương DoT: 3% của ${params.maxHP} = ${dotDamage.toFixed(2)}\n`;
        }
    }

    output += `6. Phòng thủ hiệu quả = DEF * (1 - defReduction) * (2 nếu block) * (1 - penetration) = ${params.def} * (1 - ${params.defReduction}) * ${params.hasBlock ? 2 : 1} * (1 - ${params.penetration}) = ${params.effectiveDef.toFixed(2)}\n`;
    output += `7. Sát thương cuối cùng = Max(0, Sát thương - Phòng thủ hiệu quả) = ${damage.toFixed(2)}`;
    output += '</pre>';

    // Hiển thị công thức tính hit-rate
    output += '<h4>Công thức tính Hit-rate:</h4>';
    output += '<pre>';
    output += `Weapon Range: ${params.weaponType === 'melee' ? 15 : 70}m\n`;
    if (params.distance > (params.weaponType === 'melee' ? 15 : 70)) {
        output += `Khoảng cách (${params.distance}m) vượt quá tầm đánh tối đa, Hit-rate = 0%\n`;
    } else {
        output += `Hit-rate = Max(0, 1 - (Math.floor(distance / (weaponRange / 3)) * 0.2))\n`;
        output += `         = Max(0, 1 - (${Math.floor(params.distance / ((params.weaponType === 'melee' ? 15 : 70) / 3))} * 0.2))\n`;
        output += `         = ${hitRate.toFixed(2)}`;
    }
    output += '</pre>';

    resultElement.innerHTML = output;
}

// Hiển thị modal Help
function showHelp() {
    const modal = document.getElementById('helpModal');
    const content = document.getElementById('helpContent');
    
    content.innerHTML = `
        <h3 style="color: #4a90e2;">Giải thích các trường nhập liệu:</h3>
        <h4 style="color: #e74c3c;">Người Tấn Công (Attacker):</h4>
        <ul style="color: #2c3e50;">
            <li><strong style="color: #e67e22;">ATK:</strong> Sức tấn công của người tấn công.</li>
            <li><strong style="color: #e67e22;">Buff khuếch đại sát thương:</strong> Phần trăm tăng sát thương (không bắt buộc).</li>
            <li><strong style="color: #e67e22;">Buff xuyên kháng:</strong> Phần trăm bỏ qua phòng thủ của đối phương (không bắt buộc).</li>
            <li><strong style="color: #e67e22;">Loại vũ khí:</strong> Melee (cận chiến, tầm đánh 15m) hoặc Ranged (tầm xa, tầm đánh 70m).</li>
            <li><strong style="color: #e67e22;">Loại vũ khí tầm xa:</strong>
                <ul style="color: #34495e;">
                    <li><span style="color: #16a085;">Main Armament:</span> 80% ATK, nạp 10% IS, 2 lượt nạp đạn.</li>
                    <li><span style="color: #16a085;">Secondary Armament:</span> 60% ATK, nạp 8% IS, 1 lượt nạp đạn.</li>
                    <li><span style="color: #16a085;">Missile:</span> 40% ATK, nạp 5% IS, 2 lượt nạp đạn. Có thể dùng cùng lúc với vũ khí khác.</li>
                    <li><span style="color: #16a085;">Ultimate Weapon:</span> 150% ATK, nạp 20% IS, 7 lượt nạp đạn. Chỉ có ở mecha bậc SS trở lên.</li>
                </ul>
            </li>
            <li><strong style="color: #e67e22;">Nguyên tố:</strong>
                <ul style="color: #34495e;">
                   <li><span style="color: #27ae60;">Normal:</span> Tăng sát thương khi HP đối phương giảm (5%/10%/15%/20% khi HP dưới 100%/75%/50%/25%).</li>
                    <li><span style="color: #27ae60;">Explosive:</span> Bỏ qua 2.5% DEF cho mỗi 10% máu đã mất của đối phương.</li>
                    <li><span style="color: #27ae60;">Khác:</span> Không có hiệu ứng đặc biệt.</li>
                </ul>
            </li>
        </ul>
        <h4 style="color: #3498db;">Người Phòng Thủ (Defender):</h4>
        <ul style="color: #2c3e50;">
            <li><strong style="color: #9b59b6;">DEF:</strong> Chỉ số phòng thủ của người phòng thủ.</li>
            <li><strong style="color: #9b59b6;">HP hiện tại:</strong> Lượng máu hiện tại của người phòng thủ.</li>
            <li><strong style="color: #9b59b6;">HP tối đa:</strong> Lượng máu tối đa của người phòng thủ.</li>
            <li><strong style="color: #9b59b6;">Block:</strong> Chọn có block hay không (nếu có, DEF được nhân đôi).</li>
            <li><strong style="color: #9b59b6;">Hiệu ứng:</strong>
                <ul style="color: #34495e;">
                    <li><span style="color: #c0392b;">Burn:</span> Gây sát thương 3% HP tối đa, giảm 10% DEF.</li>
                    <li><span style="color: #c0392b;">Poison:</span> Gây sát thương 3% HP tối đa.</li>
                    <li><span style="color: #c0392b;">Beam:</span> Giảm 20% DEF.</li>
                </ul>
            </li>
            <li><strong style="color: #9b59b6;">Giảm sát thương nhận vào (%):</strong> Phần trăm giảm sát thương của người phòng thủ. Sẽ được trừ trực tiếp từ % khuếch đại sát thương của người tấn công.</li>
        </ul>
        <h4 style="color: #f39c12;">Khoảng Cách:</h4>
        <ul style="color: #2c3e50;">
            <li>Khoảng cách giữa người tấn công và người phòng thủ, ảnh hưởng đến hit-rate.</li>
            <li>Khoảng cách tối đa: Melee 15m, Ranged 70m. Vượt quá sẽ có hit-rate 0%.</li>
        </ul>
        <h3 style="color: #2ecc71;">Cách tính Hit-rate:</h3>
        <p style="color: #2c3e50;">Hit-rate giảm 20% cho mỗi 1/3 tầm đánh của vũ khí. Tầm đánh: Melee 15m, Ranged 70m.</p>
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