namespace Pertemuan3
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            lblTitle = new Label();
            txtDisplay = new TextBox();
            btn7 = new Button();
            btn8 = new Button();
            btn9 = new Button();
            btnDivide = new Button();
            btn4 = new Button();
            btn5 = new Button();
            btn6 = new Button();
            btnMultiply = new Button();
            btn1 = new Button();
            btn2 = new Button();
            btn3 = new Button();
            btnMinus = new Button();
            btn0 = new Button();
            btnDecimal = new Button();
            btnClear = new Button();
            btnPlus = new Button();
            btnEquals = new Button();
            SuspendLayout();
            // 
            // lblTitle
            // 
            lblTitle.AutoSize = true;
            lblTitle.Font = new Font("Segoe UI", 14F, FontStyle.Bold);
            lblTitle.Location = new Point(20, 15);
            lblTitle.Name = "lblTitle";
            lblTitle.Size = new Size(104, 25);
            lblTitle.TabIndex = 0;
            lblTitle.Text = "Calculator";
            // 
            // txtDisplay
            // 
            txtDisplay.Font = new Font("Segoe UI", 18F);
            txtDisplay.Location = new Point(20, 50);
            txtDisplay.Name = "txtDisplay";
            txtDisplay.ReadOnly = true;
            txtDisplay.Size = new Size(244, 39);
            txtDisplay.TabIndex = 1;
            txtDisplay.Text = "0";
            txtDisplay.TextAlign = HorizontalAlignment.Right;
            // 
            // btn7
            // 
            btn7.Font = new Font("Segoe UI", 12F);
            btn7.Location = new Point(20, 100);
            btn7.Name = "btn7";
            btn7.Size = new Size(55, 50);
            btn7.TabIndex = 2;
            btn7.Text = "7";
            btn7.UseVisualStyleBackColor = true;
            btn7.Click += NumberButton_Click;
            // 
            // btn8
            // 
            btn8.Font = new Font("Segoe UI", 12F);
            btn8.Location = new Point(83, 100);
            btn8.Name = "btn8";
            btn8.Size = new Size(55, 50);
            btn8.TabIndex = 3;
            btn8.Text = "8";
            btn8.UseVisualStyleBackColor = true;
            btn8.Click += NumberButton_Click;
            // 
            // btn9
            // 
            btn9.Font = new Font("Segoe UI", 12F);
            btn9.Location = new Point(146, 100);
            btn9.Name = "btn9";
            btn9.Size = new Size(55, 50);
            btn9.TabIndex = 4;
            btn9.Text = "9";
            btn9.UseVisualStyleBackColor = true;
            btn9.Click += NumberButton_Click;
            // 
            // btnDivide
            // 
            btnDivide.Font = new Font("Segoe UI", 12F);
            btnDivide.Location = new Point(209, 100);
            btnDivide.Name = "btnDivide";
            btnDivide.Size = new Size(55, 50);
            btnDivide.TabIndex = 5;
            btnDivide.Text = "÷";
            btnDivide.UseVisualStyleBackColor = true;
            btnDivide.Click += OperatorButton_Click;
            // 
            // btn4
            // 
            btn4.Font = new Font("Segoe UI", 12F);
            btn4.Location = new Point(20, 156);
            btn4.Name = "btn4";
            btn4.Size = new Size(55, 50);
            btn4.TabIndex = 6;
            btn4.Text = "4";
            btn4.UseVisualStyleBackColor = true;
            btn4.Click += NumberButton_Click;
            // 
            // btn5
            // 
            btn5.Font = new Font("Segoe UI", 12F);
            btn5.Location = new Point(83, 156);
            btn5.Name = "btn5";
            btn5.Size = new Size(55, 50);
            btn5.TabIndex = 7;
            btn5.Text = "5";
            btn5.UseVisualStyleBackColor = true;
            btn5.Click += NumberButton_Click;
            // 
            // btn6
            // 
            btn6.Font = new Font("Segoe UI", 12F);
            btn6.Location = new Point(146, 156);
            btn6.Name = "btn6";
            btn6.Size = new Size(55, 50);
            btn6.TabIndex = 8;
            btn6.Text = "6";
            btn6.UseVisualStyleBackColor = true;
            btn6.Click += NumberButton_Click;
            // 
            // btnMultiply
            // 
            btnMultiply.Font = new Font("Segoe UI", 12F);
            btnMultiply.Location = new Point(209, 156);
            btnMultiply.Name = "btnMultiply";
            btnMultiply.Size = new Size(55, 50);
            btnMultiply.TabIndex = 9;
            btnMultiply.Text = "×";
            btnMultiply.UseVisualStyleBackColor = true;
            btnMultiply.Click += OperatorButton_Click;
            // 
            // btn1
            // 
            btn1.Font = new Font("Segoe UI", 12F);
            btn1.Location = new Point(20, 212);
            btn1.Name = "btn1";
            btn1.Size = new Size(55, 50);
            btn1.TabIndex = 10;
            btn1.Text = "1";
            btn1.UseVisualStyleBackColor = true;
            btn1.Click += NumberButton_Click;
            // 
            // btn2
            // 
            btn2.Font = new Font("Segoe UI", 12F);
            btn2.Location = new Point(83, 212);
            btn2.Name = "btn2";
            btn2.Size = new Size(55, 50);
            btn2.TabIndex = 11;
            btn2.Text = "2";
            btn2.UseVisualStyleBackColor = true;
            btn2.Click += NumberButton_Click;
            // 
            // btn3
            // 
            btn3.Font = new Font("Segoe UI", 12F);
            btn3.Location = new Point(146, 212);
            btn3.Name = "btn3";
            btn3.Size = new Size(55, 50);
            btn3.TabIndex = 12;
            btn3.Text = "3";
            btn3.UseVisualStyleBackColor = true;
            btn3.Click += NumberButton_Click;
            // 
            // btnMinus
            // 
            btnMinus.Font = new Font("Segoe UI", 12F);
            btnMinus.Location = new Point(209, 212);
            btnMinus.Name = "btnMinus";
            btnMinus.Size = new Size(55, 50);
            btnMinus.TabIndex = 13;
            btnMinus.Text = "−";
            btnMinus.UseVisualStyleBackColor = true;
            btnMinus.Click += OperatorButton_Click;
            // 
            // btn0
            // 
            btn0.Font = new Font("Segoe UI", 12F);
            btn0.Location = new Point(20, 268);
            btn0.Name = "btn0";
            btn0.Size = new Size(55, 50);
            btn0.TabIndex = 14;
            btn0.Text = "0";
            btn0.UseVisualStyleBackColor = true;
            btn0.Click += NumberButton_Click;
            // 
            // btnDecimal
            // 
            btnDecimal.Font = new Font("Segoe UI", 12F);
            btnDecimal.Location = new Point(83, 268);
            btnDecimal.Name = "btnDecimal";
            btnDecimal.Size = new Size(55, 50);
            btnDecimal.TabIndex = 15;
            btnDecimal.Text = ".";
            btnDecimal.UseVisualStyleBackColor = true;
            btnDecimal.Click += btnDecimal_Click;
            // 
            // btnClear
            // 
            btnClear.Font = new Font("Segoe UI", 12F);
            btnClear.Location = new Point(146, 268);
            btnClear.Name = "btnClear";
            btnClear.Size = new Size(55, 50);
            btnClear.TabIndex = 16;
            btnClear.Text = "C";
            btnClear.UseVisualStyleBackColor = true;
            btnClear.Click += btnClear_Click;
            // 
            // btnPlus
            // 
            btnPlus.Font = new Font("Segoe UI", 12F);
            btnPlus.Location = new Point(209, 268);
            btnPlus.Name = "btnPlus";
            btnPlus.Size = new Size(55, 50);
            btnPlus.TabIndex = 17;
            btnPlus.Text = "+";
            btnPlus.UseVisualStyleBackColor = true;
            btnPlus.Click += OperatorButton_Click;
            // 
            // btnEquals
            // 
            btnEquals.Font = new Font("Segoe UI", 12F);
            btnEquals.Location = new Point(20, 324);
            btnEquals.Name = "btnEquals";
            btnEquals.Size = new Size(244, 45);
            btnEquals.TabIndex = 18;
            btnEquals.Text = "=";
            btnEquals.UseVisualStyleBackColor = true;
            btnEquals.Click += btnEquals_Click;
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(284, 385);
            Controls.Add(lblTitle);
            Controls.Add(txtDisplay);
            Controls.Add(btn7);
            Controls.Add(btn8);
            Controls.Add(btn9);
            Controls.Add(btnDivide);
            Controls.Add(btn4);
            Controls.Add(btn5);
            Controls.Add(btn6);
            Controls.Add(btnMultiply);
            Controls.Add(btn1);
            Controls.Add(btn2);
            Controls.Add(btn3);
            Controls.Add(btnMinus);
            Controls.Add(btn0);
            Controls.Add(btnDecimal);
            Controls.Add(btnClear);
            Controls.Add(btnPlus);
            Controls.Add(btnEquals);
            FormBorderStyle = FormBorderStyle.FixedSingle;
            MaximizeBox = false;
            Name = "Form1";
            StartPosition = FormStartPosition.CenterScreen;
            Text = "Calculator";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label lblTitle;
        private TextBox txtDisplay;
        private Button btn7;
        private Button btn8;
        private Button btn9;
        private Button btnDivide;
        private Button btn4;
        private Button btn5;
        private Button btn6;
        private Button btnMultiply;
        private Button btn1;
        private Button btn2;
        private Button btn3;
        private Button btnMinus;
        private Button btn0;
        private Button btnDecimal;
        private Button btnClear;
        private Button btnPlus;
        private Button btnEquals;
    }
}
