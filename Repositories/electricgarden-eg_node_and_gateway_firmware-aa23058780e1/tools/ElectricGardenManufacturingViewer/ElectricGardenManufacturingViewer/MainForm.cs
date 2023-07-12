using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace ElectricGardenManufacturingViewer
{
    public partial class MainForm : Form
    {
        public MainForm()
        {
            InitializeComponent();
        }

        private List<dynamic> devices = null;

        private static bool DynamicHasProperty(dynamic obj, string property)
        {
            return ((IDictionary<string, dynamic>)obj).ContainsKey(property);
        }

        private static DateTime DeviceLastUpdate(dynamic device)
        {
            var updated = "";
            if (DynamicHasProperty(device, "updated"))
            {
                updated = device.updated.date;
            }
            else
            {
                updated = device.instantiated.date;
            }
            return DateTime.Parse(updated);
        }

        private static Comparison<dynamic> deviceSorter = new Comparison<dynamic>((ent1, ent2) =>
        {
            var ent1_updated = "";
            var ent2_updated = "";
            if (DynamicHasProperty(ent1, "updated"))
            {
                ent1_updated = ent1.updated.date;
            }
            else
            {
                ent1_updated = ent1.instantiated.date;
            }
            if (DynamicHasProperty(ent2, "updated"))
            {
                ent2_updated = ent2.updated.date;
            }
            else
            {
                ent2_updated = ent2.instantiated.date;
            }
            return Math.Sign(DateTime.Parse(ent2_updated).Ticks - DateTime.Parse(ent1_updated).Ticks);

        });

        private async Task UpdateDeviceList()
        {
            devices = await Queries.GetDevices();
            devices.Sort(deviceSorter);
            var selectedItems = this.listView1.SelectedItems;
            var serials = selectedItems.Cast<ListViewItem>().Select(item => item.Text).ToList();
            SuspendLayout();
            this.listView1.BeginUpdate();
            this.listView1.Items.Clear();
            this.listView1.Items.AddRange(devices.Select(device =>
            {
                try
                {
                    return new ListViewItem(new string[] { device.serial, device.properties.uname.egversion, DeviceLastUpdate(device).ToString(), device.deviceTypeName });
                }
                catch (Exception e)
                {
                    try
                    {
                        return new ListViewItem(new string[] { device.serial, "", "", "" });
                    }
                    catch (Exception ex)
                    {
                        return new ListViewItem(new string[] { "/!\\ No Serial", "", "", "" });
                    }
                }
            }).ToArray());
            foreach(ListViewItem item in this.listView1.Items)
            {
                item.Selected = serials.Contains(item.Text);
            }
            this.listView1.EndUpdate();
            ResumeLayout();
            testSheetsToolStripMenuItem.Visible = true;
        }

        private async void MainForm_Load(object sender, EventArgs e)
        {
            await UpdateDeviceList();
        }

        private String InstantiatedSummary(dynamic instantiated)
        {
            return instantiated.user + " on " + instantiated.machine;
        }

        private async void listView1_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (devices != null && listView1.SelectedIndices.Count > 0)
            {
                var index = listView1.SelectedIndices[0];
                var device = devices[index];
                var deviceSummary = new DeviceSummary()
                {
                    SerialNumber = device.serial
                };
                try
                {
                    deviceSummary.MacAddress = device.mac;
                    deviceSummary.DeviceType = device.deviceTypeName;
                    deviceSummary.LoraAddress = device.properties.lora_addr;
                    deviceSummary.System = device.properties.uname.sysname + " " + device.properties.uname.lorawan + " " + device.properties.uname.release;
                    deviceSummary.Firmware = device.properties.uname.egversion;
                    deviceSummary.CPUId = device.cpuid;
                    deviceSummary.HardwareUUID = device._hardware;
                    deviceSummary.FlashDevice = device.flash.manufacturer + ":" + device.flash.device;
                    deviceSummary.Batch = device.batch;
                    deviceSummary.BatchInstance = device.batchUnit;
                    deviceSummary.CreatedBy = InstantiatedSummary(device.instantiated);
                    deviceSummary.UpdatedBy = InstantiatedSummary(device.updated);
                } catch (Exception _ex)
                {

                }
                this.propertyGrid1.SelectedObject = deviceSummary;
                this.propertyGrid1.Refresh();

                if (tabControl1.SelectedTab == tabPage2)
                {
                    await UpdateLogs();
                }
            }
        }

        class DeviceSummary
        {
            public string SerialNumber { get; internal set; }
            public string MacAddress { get; internal set; }
            public string DeviceType { get; internal set; }
            public string LoraAddress { get; internal set; }
            public string System { get; internal set; }
            public string Firmware { get; internal set; }
            public string CPUId { get; internal set; }
            public string HardwareUUID { get; internal set; }
            public string FlashDevice { get; internal set; }
            public int Batch { get; internal set; }
            public int BatchInstance { get; internal set; }
            public string CreatedBy { get; internal set; }
            public string UpdatedBy { get; internal set; }
        }

        private async Task UpdateLogs()
        {
            var index = listView1.SelectedIndices[0];
            var device = devices[index];
            var serial = device.serial;
            List<LogDocument> logs = await Queries.GetLogs(serial);
            logs.Sort((a, b) => Math.Sign(DateTime.Parse(b.timestamp).Ticks - DateTime.Parse(a.timestamp).Ticks));
            var logItems = logs.Select(log =>
            {
                try
                {
                    return new ListViewItem(new string[] { DateTime.Parse(log.timestamp).ToString(), log.machine.ToString(), log.user.ToString(), log.record.level.ToString(), log.record.message.ToString() });
                }
                catch (Exception ex)
                {
                    return new ListViewItem(new string[] { DateTime.Parse(log.timestamp).ToString(), log.machine.ToString(), log.user.ToString(), "FAIL", "Failed to read log from database." });
                }

            }).ToArray();
            viewLogs.Items.Clear();
            viewLogs.Items.AddRange(logItems);
        }

        private async void tabControl1_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (tabControl1.SelectedTab == tabPage2 && listView1.SelectedIndices.Count > 0)
            {
                await UpdateLogs();
            }
        }

        private async void autoUpdate_Tick(object sender, EventArgs e)
        {
            await Task.Run(async () =>
            {
                try
                {
                    await UpdateDeviceList();
                }
                catch (Exception ex)
                {

                }
                try
                {
                    await UpdateLogs();
                }
                catch (Exception ex2)
                {

                }
            });

        }

        private async void printLabelToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (listView1.SelectedIndices.Count != 1)
            {
                MessageBox.Show("One device must be selected.", "Print Label", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            else
            {
                var index = listView1.SelectedIndices[0];
                var device = devices[index];
                var serial = device.serial;
                String type = device.deviceTypeName == "node" ? "" : "GW:";
                if (device.deviceTypeName == "gateway")
                {
                    Printing.PrintLabel(type + serial);
                } else
                {
                    var entries = await FriendlyNames.Entries();
                    var nodeEntry = entries.FirstOrDefault(entry => entry.SerialNumber == serial);
                    if (nodeEntry == null)
                    {
                        MessageBox.Show(String.Format("Device {0} does not have a friendly name, please sync.", type), "No friendly name", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        return;
                    }
                    Printing.PrintNodeLabel(type + serial, nodeEntry.Name);
                }
            }
        }

        delegate void UpdateSyncNameDelegate(string syncName);

        private void UpdateSyncName(string syncName)
        {
            if (!this.InvokeRequired)
            {
                testSheetsToolStripMenuItem.Text = syncName;
            } else
            {
                Invoke((UpdateSyncNameDelegate)UpdateSyncName, syncName);
            }
        }

        private async void testSheetsToolStripMenuItem_Click(object sender, EventArgs e)
        {
            try
            {
                testSheetsToolStripMenuItem.Enabled = false;
                autoUpdate.Enabled = false;
                await UpdateDeviceList();
                await Task.Run(async () =>
                {
                    UpdateSyncName("Syncing...");
                    if (devices != null && devices.Count > 0)
                    {

                        var orderedNodes = devices.Where(device => DynamicHasProperty(device, "deviceTypeName") && "node" == device.deviceTypeName)
                            .OrderBy(device => device.batch)
                            .ThenBy(device => device.batchUnit)
                    .ToList();
                        var entries = await FriendlyNames.Entries();
                        for (var i = 0; i < orderedNodes.Count; i++)
                        {
                            var node = orderedNodes[i];
                            var serial = node.serial;
                            int uid = i + 1;
                            var friendlyEntry = entries.First(entry => entry.UID == uid);
                            if (!String.IsNullOrWhiteSpace(friendlyEntry.SerialNumber) && friendlyEntry.SerialNumber != serial)
                            {
                                MessageBox.Show(String.Format("Conflict, UID {0} is recorded as {1}, but I believe it should be {2}", uid, friendlyEntry.SerialNumber, serial), "Register Conflict", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
                            }
                            else if (!friendlyEntry.SerialNumber.Equals(serial))
                            {
                                friendlyEntry.SerialNumber = serial;
                                await friendlyEntry.Write();
                            }
                            UpdateSyncName(String.Format("Syncing {0}%", (int)(100 * i / orderedNodes.Count)));
                        }
                    }
                    UpdateSyncName("Sync Friendly Names");
                });
            }
            finally
            {
                autoUpdate.Enabled = true;
                testSheetsToolStripMenuItem.Enabled = true;
            }
        }
    }
}
