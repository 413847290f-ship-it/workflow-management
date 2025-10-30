// DOM 元素引用
const addWorkflowBtn = document.getElementById('addWorkflowBtn');
const addWorkflowModal = document.getElementById('addWorkflowModal');
const modalClose = document.querySelector('.modal-close');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const workflowForm = document.getElementById('workflowForm');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const filterSelects = document.querySelectorAll('.filter-select');

// 删除确认模态框元素
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const deleteModalClose = document.getElementById('deleteModalClose');
const deleteCancelBtn = document.getElementById('deleteCancelBtn');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
const deleteConfirmText = document.getElementById('deleteConfirmText');
// 注释掉不存在的元素
// const workflowGrid = document.querySelector('.workflow-grid');
// const emptyState = document.querySelector('.empty-state');

// 工作流数据 - 初始为空数组
let workflows = [];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化空的工作流列表
    workflows = [];
    
    // 添加一些示例数据用于测试筛选功能
    // 注意：在实际应用中，这些数据应该从服务器获取
    const sampleWorkflows = [
        {
            id: 1,
            name: '数学选择题工作流',
            description: '处理数学选择题的OCR识别',
            workflowName: 'wf.ocr.liberal_small',
            tenant: 'tenant1',
            subject: 'math',
            grade: 'grade1',
            questionType: 'choice',
            status: 'active'
        },
        {
            id: 2,
            name: '语文填空题工作流',
            description: '处理语文填空题的OCR识别',
            workflowName: 'wf.ocr.science_small',
            tenant: 'tenant2',
            subject: 'chinese',
            grade: 'grade2',
            questionType: 'fill',
            status: 'active'
        },
        {
            id: 3,
            name: '英语问答题工作流',
            description: '处理英语问答题的OCR识别',
            workflowName: 'wf.ocr.composition',
            tenant: 'tenant1',
            subject: 'english',
            grade: 'grade3',
            questionType: 'essay',
            status: 'active'
        }
    ];
    
    // 可以通过这行代码来添加示例数据进行测试
    // workflows = sampleWorkflows;
    
    bindEvents();
    renderWorkflowList(); // 初始化工作流列表，显示空状态
});

// 绑定事件
function bindEvents() {
    // 新增工作流按钮
    if (addWorkflowBtn) {
        addWorkflowBtn.addEventListener('click', openModal);
    }
    
    // 模态框关闭
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // 点击模态框背景关闭
    if (addWorkflowModal) {
        addWorkflowModal.addEventListener('click', function(e) {
            if (e.target === addWorkflowModal) {
                closeModal();
            }
        });
    }
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && addWorkflowModal && addWorkflowModal.classList.contains('show')) {
            closeModal();
        }
    });
    
    // 保存按钮
    if (saveBtn) {
        saveBtn.addEventListener('click', saveWorkflow);
    }
    
    // 表单字段实时验证
    const formFields = ['tenant', 'subject', 'grade', 'questionType', 'workflowName', 'prompt'];
    formFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            // 失去焦点时验证
            field.addEventListener('blur', function() {
                validateField(fieldName, this.value);
            });
            
            // 输入时清除错误状态
            field.addEventListener('input', function() {
                if (this.style.borderColor === 'rgb(217, 48, 37)') {
                    this.style.borderColor = '';
                    this.style.boxShadow = '';
                }
            });
        }
    });
    
    // 搜索功能
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // 实时搜索
        searchInput.addEventListener('input', debounce(performSearch, 300));
    }
    
    // 筛选功能
    if (filterSelects) {
        filterSelects.forEach(select => {
            select.addEventListener('change', performFilter);
        });
    }
    
    // 导航菜单点击
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有active类
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            // 添加active类到当前项
            this.classList.add('active');
        });
    });
    
    // 删除确认模态框事件绑定
    if (deleteModalClose) {
        deleteModalClose.addEventListener('click', closeDeleteModal);
    }
    
    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', closeDeleteModal);
    }
    
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', confirmDeleteWorkflow);
    }
    
    // 点击删除确认模态框背景关闭
    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener('click', function(e) {
            if (e.target === deleteConfirmModal) {
                closeDeleteModal();
            }
        });
    }
    
    // 初始化悬浮提示功能
    initTooltip();
}

// 验证单个字段
function validateField(fieldName, value) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    if (!value || value.trim() === '') {
        field.style.borderColor = '#d93025';
        field.style.boxShadow = '0 0 0 2px rgba(217, 48, 37, 0.2)';
        return false;
    } else {
        field.style.borderColor = '#1a73e8';
        field.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.2)';
        setTimeout(() => {
            field.style.borderColor = '';
            field.style.boxShadow = '';
        }, 1000);
        return true;
    }
}

// 全局变量来跟踪当前模式
let currentEditId = null;

// 打开模态框
function openModal() {
    addWorkflowModal.classList.add('show');
    addWorkflowModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // 根据模式设置标题和处理表单
    const modalTitle = document.getElementById('modalTitle');
    if (currentEditId !== null) {
        modalTitle.textContent = '编辑工作流配置';
        // 编辑模式不重置表单，数据已在editWorkflow中填充
    } else {
        modalTitle.textContent = '新增工作流设置';
        // 新增模式才重置表单和设置默认值
        workflowForm.reset();
        
        // 设置默认值
        document.getElementById('tenant').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('grade').value = '';
        document.getElementById('questionType').value = '';
        document.getElementById('workflowName').value = '';
        document.getElementById('promptText').value = 'Test';
    }
    
    // 清除字段高亮
    clearFieldHighlights();
}

// 关闭模态框
function closeModal() {
    addWorkflowModal.classList.remove('show');
    addWorkflowModal.style.display = 'none';
    document.body.style.overflow = '';
    
    // 重置编辑状态
    currentEditId = null;
}

// 保存工作流
function saveWorkflow() {
    if (currentEditId !== null) {
        // 编辑模式，调用更新函数
        updateWorkflow(currentEditId);
        return;
    }
    
    // 新增模式
    const formData = new FormData(workflowForm);
    
    // 获取表单数据
    const workflowData = {
        id: workflows.length + 1,
        tenant: formData.get('tenant'),
        subject: formData.get('subject'),
        grade: formData.get('grade'),
        questionType: formData.get('questionType'),
        workflowName: formData.get('workflowName'),
        prompt: formData.get('promptText'), // 修正字段名称
        creator: '当前用户',
        createTime: new Date().toISOString().split('T')[0],
        status: 'active'
    };
    
    // 验证必填字段
    const requiredFields = ['tenant', 'subject', 'grade', 'questionType', 'prompt']; // 修正字段名称，使用prompt而不是promptText
    const missingFields = [];
    
    requiredFields.forEach(field => {
        if (!workflowData[field] || workflowData[field].trim() === '') {
            missingFields.push(field);
        }
    });
    
    if (missingFields.length > 0) {
        showNotification('请填写所有必填字段', 'error');
        // 高亮显示未填写的字段
        highlightMissingFields(missingFields);
        return;
    }
    
    // 添加到数据中
    workflows.unshift(workflowData);
    
    // 渲染工作流列表
    renderWorkflowList();
    
    // 关闭模态框
    closeModal();
    
    // 显示成功消息
    showNotification('工作流设置保存成功！', 'success');
    
    // 清除字段高亮
    clearFieldHighlights();
}

// 渲染工作流列表
function renderWorkflowList() {
    const workflowListContainer = document.querySelector('.workflow-list');
    const emptyState = workflowListContainer.querySelector('.empty-state');
    const listCount = document.querySelector('.list-count');
    
    // 更新计数
    listCount.textContent = `共 ${workflows.length} 个工作流`;
    
    // 移除现有的工作流行
    const existingRows = workflowListContainer.querySelectorAll('.workflow-row');
    existingRows.forEach(row => row.remove());
    
    if (workflows.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    // 隐藏空状态
    emptyState.style.display = 'none';
    
    // 创建工作流行
    workflows.forEach(workflow => {
        const workflowRow = createWorkflowRow(workflow);
        // 在表头后面插入工作流行
        const tableHeader = workflowListContainer.querySelector('.table-header');
        tableHeader.insertAdjacentElement('afterend', workflowRow);
    });
}

// 添加value到显示文本的映射函数
function getDisplayText(fieldName, value) {
    const mappings = {
        tenant: {
            'tenant1': '租户1',
            'tenant2': '租户2'
        },
        subject: {
            'math': '数学',
            'chinese': '语文',
            'english': '英语'
        },
        grade: {
            'grade1': '一年级',
            'grade2': '二年级',
            'grade3': '三年级'
        },
        questionType: {
            'choice': '选择题',
            'fill': '填空题',
            'essay': '问答题'
        },
        workflowName: {
        '': '未设置',
        'wf.ocr.liberal_small': '文科小区域队列（队列名称：wf.ocr.liberal_small）',
        'wf.ocr.science_small': '理科小区域队列（队列名称：wf.ocr.science_small）',
        'wf.ocr.table_text': '表格文字队列（队列名称：wf.ocr.table_text）',
        'wf.ocr.composition': '大作文队列（队列名称：wf.ocr.composition）',
        'wf.ocr.formula': '公式符号队列（队列名称：wf.ocr.formula）'
    }
    };
    
    if (mappings[fieldName] && mappings[fieldName][value]) {
        return mappings[fieldName][value];
    }
    return value || '未设置';
}

function createWorkflowRow(workflow) {
    const row = document.createElement('div');
    row.className = 'workflow-row';
    row.innerHTML = `
        <div class="row-cell">${getDisplayText('workflowName', workflow.workflowName)}</div>
        <div class="row-cell">${getDisplayText('tenant', workflow.tenant)}</div>
        <div class="row-cell">${getDisplayText('subject', workflow.subject)}</div>
        <div class="row-cell">${getDisplayText('grade', workflow.grade)}</div>
        <div class="row-cell">${getDisplayText('questionType', workflow.questionType)}</div>
        <div class="row-cell">
            <button class="action-btn edit-btn" onclick="editWorkflow(${workflow.id})" title="编辑">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteWorkflow(${workflow.id})" title="删除">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return row;
}

// 高亮显示未填写的字段
function highlightMissingFields(missingFields) {
    // 先清除之前的高亮
    clearFieldHighlights();
    
    missingFields.forEach(fieldName => {
        // 对于promptText字段，需要使用promptText作为ID
        const fieldId = fieldName === 'promptText' ? 'promptText' : fieldName;
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#d93025';
            field.style.boxShadow = '0 0 0 2px rgba(217, 48, 37, 0.2)';
        }
    });
}

// 清除字段高亮
function clearFieldHighlights() {
    const fields = ['tenant', 'subject', 'grade', 'questionType', 'workflowName', 'promptText']; // 修正字段名称
    fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.style.borderColor = '';
            field.style.boxShadow = '';
        }
    });
}

// 渲染工作流列表
function renderWorkflows(workflows = workflowData) {
    const workflowGrid = document.getElementById('workflowGrid');
    const emptyState = document.getElementById('emptyState');
    const workflowCount = document.getElementById('workflowCount');
    
    // 如果元素不存在，直接返回
    if (!workflowGrid && !emptyState && !workflowCount) {
        return;
    }
    
    if (workflowCount) {
        workflowCount.textContent = workflows.length;
    }
    
    if (workflows.length === 0) {
        if (workflowGrid) workflowGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (workflowGrid) {
        workflowGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        workflowGrid.innerHTML = workflows.map(workflow => `
            <div class="workflow-card">
                <div class="card-header">
                    <h4>${workflow.name}</h4>
                    <div class="card-status ${workflow.status}">${workflow.status === 'active' ? '启用' : '禁用'}</div>
                </div>
                <div class="card-content">
                    <p class="card-description">${workflow.description}</p>
                    <div class="card-meta">
                        <span class="meta-item">
                            <i class="fas fa-user"></i>
                            创建者：${workflow.creator}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-calendar"></i>
                            创建时间：${workflow.createTime}
                        </span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-outline" onclick="editWorkflow(${workflow.id})">编辑</button>
                    <button class="btn btn-sm btn-outline" onclick="copyWorkflow(${workflow.id})">复制</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteWorkflow(${workflow.id})">删除</button>
                </div>
            </div>
        `).join('');
    }
}

// 创建工作流卡片
function createWorkflowCard(workflow) {
    const card = document.createElement('div');
    card.className = 'workflow-card';
    card.innerHTML = `
        <div class="card-header">
            <h4>${workflow.name}</h4>
            <div class="card-status ${workflow.status}">${workflow.status === 'active' ? '启用' : '禁用'}</div>
        </div>
        <div class="card-content">
            <p class="card-description">${workflow.description}</p>
            <div class="card-meta">
                <span class="meta-item">
                    <i class="fas fa-user"></i>
                    创建者：${workflow.creator}
                </span>
                <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    创建时间：${workflow.createTime}
                </span>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn btn-sm btn-outline" onclick="editWorkflow(${workflow.id})">编辑</button>
            <button class="btn btn-sm btn-outline" onclick="copyWorkflow(${workflow.id})">复制</button>
            <button class="btn btn-sm btn-danger" onclick="deleteWorkflow(${workflow.id})">删除</button>
        </div>
    `;
    
    return card;
}

// 搜索功能
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredWorkflows = workflows.filter(workflow => 
        workflow.name.toLowerCase().includes(searchTerm) ||
        workflow.description.toLowerCase().includes(searchTerm)
    );
    // renderWorkflows(filteredWorkflows);
}

// 筛选功能
function performFilter() {
    const workflowNameFilter = document.getElementById('workflowNameFilter').value;
    const tenantFilter = document.getElementById('tenantFilter').value;
    const subjectFilter = document.getElementById('subjectFilter').value;
    const gradeFilter = document.getElementById('gradeFilter').value;
    const questionTypeFilter = document.getElementById('questionTypeFilter').value;
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    let filteredWorkflows = workflows.filter(workflow => {
        const matchesSearch = !searchTerm || 
            workflow.name.toLowerCase().includes(searchTerm) ||
            workflow.description.toLowerCase().includes(searchTerm);
        
        const matchesWorkflowName = !workflowNameFilter || workflow.workflowName === workflowNameFilter;
        const matchesTenant = !tenantFilter || workflow.tenant === tenantFilter;
        const matchesSubject = !subjectFilter || workflow.subject === subjectFilter;
        const matchesGrade = !gradeFilter || workflow.grade === gradeFilter;
        const matchesQuestionType = !questionTypeFilter || workflow.questionType === questionTypeFilter;
        
        return matchesSearch && matchesWorkflowName && matchesTenant && matchesSubject && matchesGrade && matchesQuestionType;
    });
    
    // 更新工作流列表显示
    renderFilteredWorkflows(filteredWorkflows);
    
    // 显示筛选结果通知
    showNotification(`筛选完成，找到 ${filteredWorkflows.length} 个匹配的工作流`, 'success');
}

// 渲染筛选后的工作流列表
function renderFilteredWorkflows(filteredWorkflows) {
    const workflowListContainer = document.querySelector('.workflow-list');
    const emptyState = workflowListContainer.querySelector('.empty-state');
    const listCount = document.querySelector('.list-count');
    
    // 更新计数
    listCount.textContent = `共 ${filteredWorkflows.length} 个工作流`;
    
    // 移除现有的工作流行
    const existingRows = workflowListContainer.querySelectorAll('.workflow-row');
    existingRows.forEach(row => row.remove());
    
    if (filteredWorkflows.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    // 隐藏空状态
    emptyState.style.display = 'none';
    
    // 创建工作流行
    filteredWorkflows.forEach(workflow => {
        const workflowRow = createWorkflowRow(workflow);
        // 在表头后面插入工作流行
        const tableHeader = workflowListContainer.querySelector('.table-header');
        tableHeader.insertAdjacentElement('afterend', workflowRow);
    });
}

// 清除筛选
function clearFilters() {
    // 重置所有筛选器下拉框到默认选项
    document.getElementById('workflowNameFilter').selectedIndex = 0;
    document.getElementById('tenantFilter').selectedIndex = 0;
    document.getElementById('subjectFilter').selectedIndex = 0;
    document.getElementById('gradeFilter').selectedIndex = 0;
    document.getElementById('questionTypeFilter').selectedIndex = 0;
    
    // 清空搜索框
    if (searchInput) {
        searchInput.value = '';
    }
    
    // 重新渲染完整的工作流列表
    renderWorkflowList();
    
    // 显示清除成功的通知
    showNotification('筛选条件已清除', 'success');
}

// 编辑工作流
function editWorkflow(id) {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
        // 设置编辑模式
        currentEditId = id;
        
        // 填充表单数据
        document.querySelector('select[name="tenant"]').value = workflow.tenant || '';
        document.querySelector('select[name="subject"]').value = workflow.subject || '';
        document.querySelector('select[name="grade"]').value = workflow.grade || '';
        document.querySelector('select[name="questionType"]').value = workflow.questionType || '';
        document.querySelector('select[name="workflowName"]').value = workflow.workflowName || '';
        document.querySelector('textarea[name="promptText"]').value = workflow.prompt || ''; // 修正字段名称
        
        openModal();
    }
}

// 更新工作流
function updateWorkflow(id) {
    const formData = new FormData(workflowForm);
    
    // 获取表单数据
    const updatedData = {
        tenant: formData.get('tenant'),
        subject: formData.get('subject'),
        grade: formData.get('grade'),
        questionType: formData.get('questionType'),
        workflowName: formData.get('workflowName'),
        prompt: formData.get('promptText') // 修正字段名称
    };
    
    // 验证必填字段
    const requiredFields = ['tenant', 'subject', 'grade', 'questionType', 'prompt']; // 修正字段名称，使用prompt而不是promptText
    const missingFields = [];
    
    requiredFields.forEach(field => {
        if (!updatedData[field] || updatedData[field].trim() === '') {
            missingFields.push(field);
        }
    });
    
    if (missingFields.length > 0) {
        showNotification('请填写所有必填字段', 'error');
        highlightMissingFields(missingFields);
        return;
    }
    
    // 更新工作流数据
    const workflowIndex = workflows.findIndex(w => w.id === id);
    if (workflowIndex !== -1) {
        workflows[workflowIndex] = {
            ...workflows[workflowIndex],
            ...updatedData
        };
        
        // 重新渲染列表
        renderWorkflowList();
        
        // 关闭模态框
        closeModal();
        
        // 显示成功消息
        showNotification('工作流更新成功！', 'success');
        
        // 清除字段高亮
        clearFieldHighlights();
        
        // 恢复保存按钮的原始行为
        saveBtn.onclick = saveWorkflow;
    }
}

// 复制工作流
function copyWorkflow(id) {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
        const newWorkflow = {
            ...workflow,
            id: workflows.length + 1,
            name: workflow.name + ' (副本)',
            creator: '当前用户',
            createTime: new Date().toISOString().split('T')[0]
        };
        
        workflows.unshift(newWorkflow);
        // renderWorkflows(workflows);
        showNotification('工作流复制成功！', 'success');
    }
}

// 工作流名称映射函数
function getWorkflowDisplayName(workflowName) {
    const nameMapping = {
        'wf.ocr.liberal_small': '文科小区域队列',
        'wf.ocr.science_small': '理科小区域队列',
        'wf.ocr.composition': '作文队列',
        'wf.ocr.liberal_large': '文科大区域队列',
        'wf.ocr.science_large': '理科大区域队列',
        'wf.ocr.math_formula': '数学公式队列',
        'wf.ocr.english_reading': '英语阅读队列'
    };
    
    return nameMapping[workflowName] || workflowName || '未命名工作流';
}

// 删除工作流变量
let deleteWorkflowId = null;

// 打开删除确认模态框
function openDeleteModal(id) {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
        deleteWorkflowId = id;
        
        // 设置确认文本
        const workflowDisplayName = getWorkflowDisplayName(workflow.workflowName);
        const tenantText = getDisplayText('tenant', workflow.tenant);
        const subjectText = getDisplayText('subject', workflow.subject);
        const gradeText = getDisplayText('grade', workflow.grade);
        const questionTypeText = getDisplayText('questionType', workflow.questionType);
        
        deleteConfirmText.textContent = `您确定要删除「${workflowDisplayName} - ${tenantText} - ${subjectText} - ${gradeText} - ${questionTypeText}」的这条工作流配置吗？此操作不可恢复。`;
        
        // 显示模态框
        deleteConfirmModal.classList.add('show');
        deleteConfirmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// 关闭删除确认模态框
function closeDeleteModal() {
    deleteConfirmModal.classList.remove('show');
    deleteConfirmModal.style.display = 'none';
    document.body.style.overflow = '';
    deleteWorkflowId = null;
}

// 确认删除工作流
function confirmDeleteWorkflow() {
    if (deleteWorkflowId !== null) {
        workflows = workflows.filter(w => w.id !== deleteWorkflowId);
        renderWorkflowList();
        closeDeleteModal();
        showNotification('删除成功！', 'success');
    }
}

// 删除工作流
function deleteWorkflow(id) {
    openDeleteModal(id);
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 关闭按钮事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // 自动关闭
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 移动端菜单切换
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// 添加移动端菜单按钮（如果需要）
if (window.innerWidth <= 768) {
    const headerLeft = document.querySelector('.header-left');
    const menuBtn = document.createElement('button');
    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 5px;
        margin-right: 15px;
    `;
    menuBtn.addEventListener('click', toggleSidebar);
    headerLeft.insertBefore(menuBtn, headerLeft.firstChild);
}

// 响应式处理
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.querySelector('.sidebar').classList.remove('open');
    }
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.3s;
    }
    
    .notification-close:hover {
        background-color: rgba(255,255,255,0.2);
    }
`;

// 悬浮提示功能
function initTooltip() {
    const workflowSelect = document.getElementById('workflowName');
    if (!workflowSelect) return;

    let tooltip = null;
    let customDropdown = null;
    let isDropdownOpen = false;

    // 创建提示框
    function createTooltip() {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        tooltip.style.transition = 'opacity 0.2s ease, visibility 0.2s ease';
        document.body.appendChild(tooltip);
    }

    // 创建自定义下拉框
    function createCustomDropdown() {
        // 隐藏原生select
        workflowSelect.style.display = 'none';
        
        // 创建自定义下拉框容器
        const container = document.createElement('div');
        container.className = 'custom-select-container';
        container.style.position = 'relative';
        container.style.width = '100%';
        
        // 创建显示框
        const display = document.createElement('div');
        display.className = 'custom-select-display';
        display.style.cssText = `
            border: 1px solid #ddd;
            padding: 8px 12px;
            background: white;
            cursor: pointer;
            border-radius: 4px;
            min-height: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        display.innerHTML = '<span>请选择工作流名称</span><i class="fas fa-chevron-down"></i>';
        
        // 创建下拉选项容器
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-select-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        // 添加选项
        Array.from(workflowSelect.options).forEach((option, index) => {
            if (option.value === '') return; // 跳过默认选项
            
            const optionDiv = document.createElement('div');
            optionDiv.className = 'custom-select-option';
            optionDiv.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: background-color 0.2s ease;
            `;
            optionDiv.textContent = option.textContent;
            optionDiv.dataset.value = option.value;
            optionDiv.dataset.tooltip = option.getAttribute('data-tooltip');
            
            // 鼠标悬停事件
            optionDiv.addEventListener('mouseenter', function(e) {
                this.style.backgroundColor = '#f5f5f5';
                showTooltip(this, e);
            });
            
            optionDiv.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
                hideTooltip();
            });
            
            // 点击选择
            optionDiv.addEventListener('click', function() {
                // 更新原生select的值
                workflowSelect.value = this.dataset.value;
                
                // 更新显示文本
                display.querySelector('span').textContent = this.textContent;
                
                // 隐藏下拉框
                dropdown.style.display = 'none';
                isDropdownOpen = false;
                
                // 触发change事件
                const changeEvent = new Event('change', { bubbles: true });
                workflowSelect.dispatchEvent(changeEvent);
                
                hideTooltip();
            });
            
            dropdown.appendChild(optionDiv);
        });
        
        // 点击显示框切换下拉状态
        display.addEventListener('click', function() {
            if (isDropdownOpen) {
                dropdown.style.display = 'none';
                isDropdownOpen = false;
            } else {
                dropdown.style.display = 'block';
                isDropdownOpen = true;
            }
        });
        
        container.appendChild(display);
        container.appendChild(dropdown);
        
        // 插入到原select的位置
        workflowSelect.parentNode.insertBefore(container, workflowSelect);
        
        customDropdown = container;
        
        // 点击其他地方关闭下拉框
        document.addEventListener('click', function(e) {
            if (!container.contains(e.target)) {
                dropdown.style.display = 'none';
                isDropdownOpen = false;
                hideTooltip();
            }
        });
    }

    // 显示提示框
    function showTooltip(optionElement, event) {
        const tooltipText = optionElement.dataset.tooltip;
        
        if (tooltipText && tooltip) {
            // 清除之前的箭头类
            tooltip.className = 'tooltip';
            
            // 处理HTML格式的提示文本
            tooltip.innerHTML = tooltipText.replace(/<br>/g, '<br>');
            tooltip.style.opacity = '1';
            tooltip.style.visibility = 'visible';
            
            // 计算选项元素的位置
            const rect = optionElement.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let left, top;
            let arrowClass = '';
            
            // 优先在右侧显示
            if (rect.right + 10 + tooltipRect.width <= window.innerWidth) {
                // 右侧有足够空间
                left = rect.right + 10;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                arrowClass = 'arrow-left';
            } else if (rect.left - 10 - tooltipRect.width >= 0) {
                // 左侧有足够空间
                left = rect.left - tooltipRect.width - 10;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                arrowClass = 'arrow-right';
            } else if (rect.bottom + 10 + tooltipRect.height <= window.innerHeight) {
                // 下方有足够空间
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.bottom + 10;
                arrowClass = 'arrow-top';
            } else {
                // 上方显示
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.top - tooltipRect.height - 10;
                arrowClass = 'arrow-bottom';
            }
            
            // 确保不超出屏幕边界
            if (left < 10) {
                left = 10;
            } else if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            
            if (top < 10) {
                top = 10;
            } else if (top + tooltipRect.height > window.innerHeight - 10) {
                top = window.innerHeight - tooltipRect.height - 10;
            }
            
            // 应用位置和箭头样式
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
            tooltip.classList.add(arrowClass);
            
            // 如果是水平箭头，调整箭头的垂直位置
            if (arrowClass === 'arrow-left' || arrowClass === 'arrow-right') {
                const optionCenter = rect.top + (rect.height / 2);
                const tooltipTop = parseFloat(tooltip.style.top);
                const arrowOffset = optionCenter - tooltipTop;
                
                // 确保箭头在提示框范围内
                const minOffset = 16; // 最小距离顶部的距离
                const maxOffset = tooltipRect.height - 16; // 最大距离顶部的距离
                const clampedOffset = Math.max(minOffset, Math.min(maxOffset, arrowOffset));
                
                // 动态设置箭头位置
                const arrow = tooltip.querySelector('::before') || tooltip;
                tooltip.style.setProperty('--arrow-top', clampedOffset + 'px');
            }
            
            // 如果是垂直箭头，调整箭头的水平位置
            if (arrowClass === 'arrow-top' || arrowClass === 'arrow-bottom') {
                const optionCenter = rect.left + (rect.width / 2);
                const tooltipLeft = parseFloat(tooltip.style.left);
                const arrowOffset = optionCenter - tooltipLeft;
                
                // 确保箭头在提示框范围内
                const minOffset = 16;
                const maxOffset = tooltipRect.width - 16;
                const clampedOffset = Math.max(minOffset, Math.min(maxOffset, arrowOffset));
                
                // 动态设置箭头位置
                tooltip.style.setProperty('--arrow-left', clampedOffset + 'px');
            }
        }
    }

    function hideTooltip() {
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
        }
    }

    // 初始化
    createTooltip();
    createCustomDropdown();
}