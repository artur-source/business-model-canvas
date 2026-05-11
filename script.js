document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const contentBlocks = document.querySelectorAll('.content');
    const metaInputs = document.querySelectorAll('.meta-field input');
    const btnPrint = document.getElementById('btn-print');
    const btnPdf = document.getElementById('btn-pdf');
    const btnPng = document.getElementById('btn-png');
    const btnClear = document.getElementById('btn-clear');
    const btnTheme = document.getElementById('btn-theme');
    const templateSelector = document.getElementById('template-selector');

    // --- LocalStorage Logic ---
    const saveData = () => {
        const data = {
            meta: {},
            blocks: {}
        };

        metaInputs.forEach(input => {
            data.meta[input.id] = input.value;
        });

        contentBlocks.forEach(block => {
            const id = block.parentElement.dataset.id;
            data.blocks[id] = block.innerText;
        });

        localStorage.setItem('bmc_data', JSON.stringify(data));
    };

    const loadData = () => {
        const saved = localStorage.getItem('bmc_data');
        if (saved) {
            const data = JSON.parse(saved);
            
            metaInputs.forEach(input => {
                if (data.meta[input.id]) input.value = data.meta[input.id];
            });

            contentBlocks.forEach(block => {
                const id = block.parentElement.dataset.id;
                if (data.blocks[id]) block.innerText = data.blocks[id];
            });
        }
    };

    // Auto-save on input
    canvasContainer.addEventListener('input', () => {
        saveData();
    });

    // --- Theme Toggle ---
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('bmc_theme', newTheme);
        
        const icon = btnTheme.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    };

    const savedTheme = localStorage.getItem('bmc_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = btnTheme.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    btnTheme.addEventListener('click', toggleTheme);

    // --- Export Functions ---
    btnPrint.addEventListener('click', () => {
        window.print();
    });

    btnPdf.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        
        // Hide placeholders for clean PDF
        document.body.classList.add('printing-pdf');
        
        try {
            const canvas = await html2canvas(canvasContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg')
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('business-model-canvas.pdf');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            document.body.classList.remove('printing-pdf');
        }
    });

    btnPng.addEventListener('click', async () => {
        try {
            const canvas = await html2canvas(canvasContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg')
            });
            
            const link = document.createElement('a');
            link.download = 'business-model-canvas.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            alert('Erro ao gerar imagem.');
        }
    });

    btnClear.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar todo o conteúdo?')) {
            contentBlocks.forEach(block => block.innerText = '');
            metaInputs.forEach(input => input.value = '');
            saveData();
        }
    });

    // --- Templates ---
    const templates = {
        startup: {
            meta: { 'meta-version': '1.0', 'meta-designed-for': 'Nova Startup' },
            blocks: {
                'key-partnerships': 'Investidores, Fornecedores de Cloud, Parceiros de Marketing',
                'key-activities': 'Desenvolvimento de Software, Aquisição de Usuários',
                'key-resources': 'Equipe de Engenharia, Servidores, Marca',
                'value-propositions': 'Solução rápida e barata para problema X',
                'customer-relationships': 'Self-service, Comunidade Online',
                'channels': 'Redes Sociais, SEO, App Store',
                'customer-segments': 'Early adopters, Jovens profissionais',
                'cost-structure': 'Salários, Infraestrutura, Marketing',
                'revenue-streams': 'Assinatura Mensal, Freemium'
            }
        },
        ecommerce: {
            meta: { 'meta-version': '1.0', 'meta-designed-for': 'Loja Online' },
            blocks: {
                'key-partnerships': 'Transportadoras, Fabricantes, Gateways de Pagamento',
                'key-activities': 'Gestão de Estoque, Logística, Marketing Digital',
                'key-resources': 'Plataforma E-commerce, Estoque, Base de Clientes',
                'value-propositions': 'Produtos exclusivos com entrega rápida',
                'customer-relationships': 'Suporte via Chat, E-mail Marketing',
                'channels': 'Site Próprio, Instagram Shopping, Google Ads',
                'customer-segments': 'Consumidores finais (B2C)',
                'cost-structure': 'Custo de Mercadoria, Frete, Publicidade',
                'revenue-streams': 'Venda de Produtos, Taxa de Entrega'
            }
        }
    };

    templateSelector.addEventListener('change', (e) => {
        const template = templates[e.target.value];
        if (template) {
            if (confirm('Isso irá substituir o conteúdo atual. Continuar?')) {
                Object.keys(template.meta).forEach(id => {
                    const input = document.getElementById(id);
                    if (input) input.value = template.meta[id];
                });

                Object.keys(template.blocks).forEach(id => {
                    const block = document.querySelector(`[data-id="${id}"] .content`);
                    if (block) block.innerText = template.blocks[id];
                });
                saveData();
            }
        }
    });

    // Initialize
    loadData();
});
