(function() {
    var rules = [
        {
            path: "operator-expression string-literal",
            content: "\"\"",
            description: "This empty string is useful to convert other values into <code>String</code>s, because primitive values like <code>int</code> don't have <code>toString()</code> methods."
        },
        {
            path: "cast-expression primitive-type",
            description: "A <b>cast<b>, where you put <code>(aTypeInParentheses)</code> in front of another value, converts the value into the specified type. Here, it's converting to <code>{{content}}</code>."
        },
        {
            path: "if-else-expression",
            description: function(content, element) {
                var isBoolStart = content.match(/^\d/) == null;
                
                return `This is a <b>ternary expression</b>. It acts like an <code>if () {} else {}</code> block, but in just one line. It's useful for making your code shorter, but can be confusing if you're just starting Java. You can write one like this: <code>booleanVal ? value1 : value2</code>. it will equal <code>value1</code> if <code>booleanVal</code> is true or <code>value2</code> if <code>booleanVal</code> is false.` + (isBoolStart ? "" : `<hr>You might notice that this </code>booleanVal</code> is not actually a boolean value-- look to the left of the expression, and notice that it's using a comparison operator to calculate it.`);
            }
        },
        {
            path: ["constructor-declaration formal-parameters", "constructor-declaration identifier"],
            description: "This is the start of a <b>constructor</b>. It is written just like a method, except with no name. This describes how a new instance of the class can be created.",
            target: "parentElement"
        },
        {
            path: "float-literal",
            description: "An <code>f</code> after a number marks it as a float. Floats are like doubles, but they have some differences that are too complicated to get into now. Java will automatically convert them if it needs to."
        }
    ];
    
    var tooltippedWord = null, tooltipElem = null;

    function testRule(rule, wordElem) {
        var rPathArr = rule.path.constructor===Array ? rule.path : [rule.path];
        return (rule.path ? rPathArr.find(function(x) { return (wordElem.getAttribute("data-nodepath") || "").endsWith(x) }) : true) &&
            (rule.content ? wordElem.textContent == rule.content : true);
    }

    window.explainEditor = function explain(editor) {
        var words = editor.table.querySelectorAll("span.hlast");

        for(var i = 0; i < words.length; i++) {
            attachWordExplainer(words[i])
            if(words[i].classList.contains("hlast-pairedchar")) addPairedchar(words[i]);
        }

        editor.parent.addEventListener("mouseenter", function(event) {
            destroyTooltip();
        });
        
    }

    function addPairedchar(pairedchar) {
        var id = pairedchar.id;
        var partnerId = "";
        if(id.includes("-in-")) partnerId = id.replace("-in-", "-out-");
        else partnerId = id.replace("-out-", "-in-");

        var partner = document.getElementById(partnerId);
        if(!partner) return false;

        pairedchar.addEventListener("click", function() {
            pairedchar.tabIndex = "-1";
            pairedchar.focus();

            partner.classList.add("partner-selected");
            pairedchar.classList.add("partner-selected");
        });

        pairedchar.addEventListener("blur", function() {
            partner.classList.remove("partner-selected");
            pairedchar.classList.remove("partner-selected");
        });
    }
    
    function attachWordExplainer(word) {
        var applicableRuleIdx = rules.findIndex(function(rule) {
            return testRule(rule, word);
        });

        if(applicableRuleIdx < 0) return false;

        word.setAttribute("data-explain-rule", applicableRuleIdx);

        var applicableRule = rules[applicableRuleIdx];
        
        function addTooltip(elm) {
            if(applicableRule.target) elm = elm[applicableRule.target];
            
            if(typeof applicableRule.description === "string") tooltip(elm, applicableRule.description.replace(/\{\{content\}\}/g, elm.textContent));
            else if(typeof applicableRule.description === "function") tooltip(elm, applicableRule.description(elm.textContent, elm));
        }

        word.onmouseenter = function(event) {
            addTooltip(word);
        };
        word.addEventListener("mouseleave", function(event) {
            if(event.relatedTarget && event.relatedTarget.id != "explain-tooltip") destroyTooltip();
            if(event.relatedTarget && event.relatedTarget.classList.contains("hlast") && event.relatedTarget.onmouseenter) event.relatedTarget.onmouseenter();
        });
        word.addEventListener("mousemove", function(event) {
            moveTooltipX(event.clientX); 
        });
    }
    
    function moveTooltipX(x) {
        if(tooltipElem) tooltipElem.style.left = x + "px";
    }

    function tooltip(elem, content) {
        destroyTooltip();
        
        if(tooltippedWord === null) tooltippedWord = elem;
        tooltippedWord.classList.add("has-tooltip-open");
        
        var box = elem.getBoundingClientRect();

        var deltTop = window.scrollY;
        var deltLeft = window.scrollX;
        
        if(tooltipElem === null) initTooltipElem();
        
        tooltipElem.style.top = (deltTop + box.y + box.height - 2) + "px";
        tooltipElem.style.left = (deltLeft + box.x) + "px";
        tooltipElem.innerHTML = content;

        document.body.appendChild(tooltipElem);
    }
    
    function initTooltipElem() {
        tooltipElem = document.createElement("dialog");
        tooltipElem.setAttribute("open", true);
        tooltipElem.id = "explain-tooltip";
    }

    function destroyTooltip() {
        if(tooltippedWord) tooltippedWord.classList.remove("has-tooltip-open");
        tooltippedWord = null;
    
        if(tooltipElem && tooltipElem.parentElement) tooltipElem.parentElement.removeChild(tooltipElem);
    }
})();